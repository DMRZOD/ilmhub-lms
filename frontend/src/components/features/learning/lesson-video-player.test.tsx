import { createElement, createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// next/dynamic lazily imports the (browser-only) Mux web component. Replace it
// with a plain <video> stub that forwards the media event handlers so we can
// exercise the wrapper's progress/threshold/ended logic in jsdom.
vi.mock("next/dynamic", () => ({
  default: () =>
    function MuxPlayerStub(props: {
      playbackId: string;
      onTimeUpdate: (e: Event) => void;
      onEnded: () => void;
    }) {
      return createElement("video", {
        "data-testid": "mux-player",
        "data-playback-id": props.playbackId,
        onTimeUpdate: props.onTimeUpdate,
        onEnded: props.onEnded,
      });
    },
}));

import {
  LessonVideoPlayer,
  type LessonVideoPlayerHandle,
} from "./lesson-video-player";

function setMedia(el: HTMLElement, currentTime: number, duration: number) {
  Object.defineProperty(el, "currentTime", { value: currentTime, configurable: true });
  Object.defineProperty(el, "duration", { value: duration, configurable: true });
}

const baseProps = {
  playbackId: "playback-abc",
  tokenJwt: null,
  startTimeSeconds: 0,
};

describe("LessonVideoPlayer", () => {
  it("forwards the playbackId to the underlying player", () => {
    render(
      <LessonVideoPlayer
        {...baseProps}
        onPositionChange={vi.fn()}
        onEnded={vi.fn()}
      />,
    );
    expect(screen.getByTestId("mux-player")).toHaveAttribute(
      "data-playback-id",
      "playback-abc",
    );
  });

  it("reports the floored position on timeupdate", () => {
    const onPositionChange = vi.fn();
    render(
      <LessonVideoPlayer
        {...baseProps}
        onPositionChange={onPositionChange}
        onEnded={vi.fn()}
      />,
    );
    const video = screen.getByTestId("mux-player");
    setMedia(video, 42.8, 100);
    fireEvent.timeUpdate(video);
    expect(onPositionChange).toHaveBeenCalledWith(42);
  });

  it("fires onWatchedThreshold once past 90% watched", () => {
    const onWatchedThreshold = vi.fn();
    render(
      <LessonVideoPlayer
        {...baseProps}
        onPositionChange={vi.fn()}
        onEnded={vi.fn()}
        onWatchedThreshold={onWatchedThreshold}
      />,
    );
    const video = screen.getByTestId("mux-player");
    setMedia(video, 95, 100);
    fireEvent.timeUpdate(video);
    fireEvent.timeUpdate(video);
    expect(onWatchedThreshold).toHaveBeenCalledTimes(1);
  });

  it("calls onEnded when the media ends", () => {
    const onEnded = vi.fn();
    render(
      <LessonVideoPlayer
        {...baseProps}
        onPositionChange={vi.fn()}
        onEnded={onEnded}
      />,
    );
    fireEvent.ended(screen.getByTestId("mux-player"));
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("exposes the imperative handle", () => {
    const ref = createRef<LessonVideoPlayerHandle>();
    render(
      <LessonVideoPlayer
        ref={ref}
        {...baseProps}
        onPositionChange={vi.fn()}
        onEnded={vi.fn()}
      />,
    );
    expect(typeof ref.current?.togglePlay).toBe("function");
    expect(typeof ref.current?.seekTo).toBe("function");
    // Before any playback event the underlying element is unknown.
    expect(ref.current?.getCurrentTime()).toBeNull();
  });
});
