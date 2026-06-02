"use client";

import * as React from "react";
import dynamic from "next/dynamic";

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

  React.useEffect(() => {
    thresholdFiredRef.current = false;
    lastReportRef.current = 0;
  }, [playbackId]);

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
      togglePlay: () => {
        const el = playerRef.current;
        if (!el) return;
        if (el.paused) void el.play();
        else el.pause();
      },
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
    [],
  );

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-ilm-3xl bg-ilm-ink"
    >
      <MuxPlayer
        playbackId={playbackId}
        tokens={tokenJwt ? { playback: tokenJwt } : undefined}
        startTime={startTimeSeconds || undefined}
        metadata={{ video_title: title }}
        playbackRates={PLAYBACK_RATES}
        defaultHiddenCaptions
        accentColor="#ffffff"
        streamType="on-demand"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ aspectRatio: "16 / 9", width: "100%" }}
      />
    </div>
  );
});
