"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

const COUNTDOWN_SECONDS = 3;
const CIRCLE_LENGTH = 2 * Math.PI * 22;

interface Props {
  nextLessonTitle: string;
  onExpire: () => void;
  onCancel: () => void;
}

export function AutoAdvanceOverlay({
  nextLessonTitle,
  onExpire,
  onCancel,
}: Props) {
  const [remaining, setRemaining] = React.useState(COUNTDOWN_SECONDS);
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [onExpire]);

  const progress = (COUNTDOWN_SECONDS - remaining) / COUNTDOWN_SECONDS;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-20 grid place-items-center bg-ilm-ink/85 p-sp-5 text-white backdrop-blur-sm"
      >
        <div className="flex max-w-md flex-col items-center gap-sp-4 text-center">
          <div className="relative h-14 w-14">
            <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="22"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="22"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCLE_LENGTH}
                strokeDashoffset={CIRCLE_LENGTH * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-t-18 font-extrabold tabular-nums">
              {remaining}
            </span>
          </div>
          <div className="flex flex-col gap-sp-1">
            <div className="text-t-12 font-bold uppercase tracking-wider text-white/70">
              Keyingi dars
            </div>
            <div className="text-t-18 font-extrabold leading-tight">
              {nextLessonTitle}
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="border-white/40 bg-white/10 text-white hover:bg-white/20"
          >
            Bekor qilish
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
