"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Pause, Play } from "lucide-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-ilm-ink" />,
});

export interface LessonVideoPlayerProps {
  playbackId: string;
  tokenJwt: string | null;
  startTimeSeconds: number;
  title?: string;
  onPositionChange: (positionSeconds: number) => void;
  onEnded: () => void;
  onWatchedThreshold?: () => void;
}

export interface LessonVideoPlayerHandle {
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  toggleCaptions: () => void;
  seekBy: (deltaSeconds: number) => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number | null;
}

interface MuxMediaElement extends HTMLVideoElement {
  textTracks: TextTrackList;
}

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2];
const REPORT_INTERVAL_MS = 5_000;
const COMPLETION_THRESHOLD = 0.9;

export const LessonVideoPlayer = React.forwardRef<
  LessonVideoPlayerHandle,
  LessonVideoPlayerProps
>(function LessonVideoPlayer(
  {
    playbackId,
    tokenJwt,
    startTimeSeconds,
    title,
    onPositionChange,
    onEnded,
    onWatchedThreshold,
  },
  ref,
) {
  const lastReportRef = React.useRef<number>(0);
  const thresholdFiredRef = React.useRef<boolean>(false);
  const playerRef = React.useRef<MuxMediaElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = React.useState(true);

  React.useEffect(() => {
    thresholdFiredRef.current = false;
    lastReportRef.current = 0;
    setIsPaused(true);
  }, [playbackId]);

  // Toggle playback for the custom center overlay button. Shared with the
  // imperative `togglePlay` handle so the spacebar hotkey and the button stay
  // in lockstep.
  const togglePlayback = React.useCallback(() => {
    const el = playerRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  const handleTimeUpdate = React.useCallback(
    (event: Event) => {
      const el = event.target as MuxMediaElement | null;
      if (!el) return;
      playerRef.current = el;
      const current = typeof el.currentTime === "number" ? el.currentTime : 0;
      const duration = typeof el.duration === "number" ? el.duration : 0;
      const now = Date.now();

      if (now - lastReportRef.current >= REPORT_INTERVAL_MS) {
        lastReportRef.current = now;
        onPositionChange(Math.floor(current));
      }

      if (
        !thresholdFiredRef.current &&
        onWatchedThreshold &&
        duration > 0 &&
        current / duration >= COMPLETION_THRESHOLD
      ) {
        thresholdFiredRef.current = true;
        onWatchedThreshold();
      }
    },
    [onPositionChange, onWatchedThreshold],
  );

  const handleEnded = React.useCallback(() => {
    onEnded();
  }, [onEnded]);

  React.useImperativeHandle(
    ref,
    () => ({
      togglePlay: togglePlayback,
      toggleMute: () => {
        const el = playerRef.current;
        if (!el) return;
        el.muted = !el.muted;
      },
      toggleFullscreen: () => {
        const target = containerRef.current;
        if (!target) return;
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          void target.requestFullscreen?.();
        }
      },
      toggleCaptions: () => {
        const el = playerRef.current;
        if (!el) return;
        const tracks = el.textTracks;
        if (!tracks || tracks.length === 0) return;
        let anyShowing = false;
        for (let i = 0; i < tracks.length; i += 1) {
          if (tracks[i].mode === "showing") {
            anyShowing = true;
            tracks[i].mode = "disabled";
          }
        }
        if (!anyShowing) {
          for (let i = 0; i < tracks.length; i += 1) {
            if (tracks[i].kind === "subtitles" || tracks[i].kind === "captions") {
              tracks[i].mode = "showing";
              break;
            }
          }
        }
      },
      seekBy: (deltaSeconds: number) => {
        const el = playerRef.current;
        if (!el) return;
        const duration = typeof el.duration === "number" ? el.duration : 0;
        const next = Math.max(
          0,
          Math.min(duration || Infinity, (el.currentTime || 0) + deltaSeconds),
        );
        el.currentTime = next;
      },
      seekTo: (seconds: number) => {
        const el = playerRef.current;
        if (!el) return;
        const duration = typeof el.duration === "number" ? el.duration : 0;
        el.currentTime = Math.max(0, Math.min(duration || Infinity, seconds));
        void el.play?.();
      },
      getCurrentTime: () => {
        const el = playerRef.current;
        if (!el || typeof el.currentTime !== "number") return null;
        return el.currentTime;
      },
    }),
    [togglePlayback],
  );

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-ilm-3xl bg-ilm-ink"
    >
      <MuxPlayer
        playbackId={playbackId}
        tokens={tokenJwt ? { playback: tokenJwt } : undefined}
        startTime={startTimeSeconds || undefined}
        metadata={{ video_title: title }}
        playbackRates={PLAYBACK_RATES}
        defaultHiddenCaptions
        // Mux maps the control hover background to the accent color, so a white
        // accent made the white icons vanish on hover. Use the brand blue
        // (--ilm-info) — white icons stay visible on the colored hover.
        accentColor="#3b82f6"
        streamType="on-demand"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        // Capture the media element on mount so the custom center button (and
        // the spacebar hotkey) can start a not-yet-played video — `playerRef`
        // is otherwise only set once `timeupdate` fires.
        onLoadedMetadata={(event) => {
          playerRef.current = event.target as MuxMediaElement;
        }}
        onPlay={() => setIsPaused(false)}
        onPause={() => setIsPaused(true)}
        // Hide Mux's native center play button; we render our own persistent
        // overlay instead. (`--center-play-button` is a media-chrome CSS var;
        // Mux's `style` prop type allows custom properties.)
        style={{
          aspectRatio: "16 / 9",
          width: "100%",
          "--center-play-button": "none",
        }}
      />

      {/* Persistent Udemy-style center play/pause control. The wrapper is
          click-through so Mux's bottom control bar and click-to-toggle gesture
          keep working — only the button itself captures clicks. */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPaused ? "Ijro etish" : "Pauza"}
          className={cn(
            "grid size-16 place-items-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-sm transition duration-200 ease-out hover:scale-105 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
            isPaused
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-90 opacity-0 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100",
          )}
        >
          <Icon
            icon={isPaused ? Play : Pause}
            size={28}
            strokeWidth={0}
            fill="currentColor"
            className={cn("transition-transform", isPaused && "translate-x-0.5")}
          />
        </button>
      </div>
    </div>
  );
});
