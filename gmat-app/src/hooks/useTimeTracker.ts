"use client";

import { useEffect, useRef, useCallback } from "react";
import type { ActivityType } from "@/types";

interface UseTimeTrackerOptions {
  activityType: ActivityType;
  onTick?: (seconds: number) => void;
  onSessionEnd?: (totalSeconds: number, activityType: ActivityType) => void;
}

/**
 * Tracks time spent in the app for a given activity type.
 * Uses Page Visibility API to pause when the user switches tabs.
 */
export function useTimeTracker({
  activityType,
  onTick,
  onSessionEnd,
}: UseTimeTrackerOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const accumulatedRef = useRef<number>(0); // seconds accumulated before pause
  const isVisibleRef = useRef<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickSecondsRef = useRef<number>(0);

  const getElapsed = useCallback(() => {
    if (!isVisibleRef.current) return accumulatedRef.current;
    return accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const pause = useCallback(() => {
    if (!isVisibleRef.current) return;
    accumulatedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
    isVisibleRef.current = false;
  }, []);

  const resume = useCallback(() => {
    if (isVisibleRef.current) return;
    startTimeRef.current = Date.now();
    isVisibleRef.current = true;
  }, []);

  const onTickRef = useRef(onTick);
  const onSessionEndRef = useRef(onSessionEnd);

  // Keep refs up-to-date with latest callbacks
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  useEffect(() => {
    // Tick every second to update UI
    intervalRef.current = setInterval(() => {
      tickSecondsRef.current = getElapsed();
      onTickRef.current?.(tickSecondsRef.current);
    }, 1000);

    // Page visibility — pause when tab is hidden
    const handleVisibility = () => {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      const total = getElapsed();
      if (total > 5) {
        onSessionEndRef.current?.(total, activityType);
      }
    };
  }, [activityType, getElapsed, pause, resume]);

  return { getElapsed };
}
