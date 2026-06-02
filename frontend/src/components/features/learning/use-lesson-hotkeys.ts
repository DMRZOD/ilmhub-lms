"use client";

import * as React from "react";

import type { LessonVideoPlayerHandle } from "./lesson-video-player";

interface Options {
  playerRef: React.RefObject<LessonVideoPlayerHandle | null>;
  enabled: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useLessonHotkeys({
  playerRef,
  enabled,
  onNext,
  onPrev,
}: Options) {
  React.useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const player = playerRef.current;
      const key = event.key;

      switch (key) {
        case " ":
        case "Spacebar":
          event.preventDefault();
          player?.togglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          player?.seekBy(-5);
          break;
        case "ArrowRight":
          event.preventDefault();
          player?.seekBy(5);
          break;
        case "f":
        case "F":
          event.preventDefault();
          player?.toggleFullscreen();
          break;
        case "m":
        case "M":
          event.preventDefault();
          player?.toggleMute();
          break;
        case "c":
        case "C":
          event.preventDefault();
          player?.toggleCaptions();
          break;
        case "n":
        case "N":
          if (onNext) {
            event.preventDefault();
            onNext();
          }
          break;
        case "p":
        case "P":
          if (onPrev) {
            event.preventDefault();
            onPrev();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled, onNext, onPrev, playerRef]);
}
