"use client";

import React, { useEffect, useRef, useState } from "react";
import { ROLLING_COUNTDOWN_TARGET } from "../recruitmentConfig";

const COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function getRemaining(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: false,
  };
}

function resolveTarget(targetDate) {
  if (targetDate === ROLLING_COUNTDOWN_TARGET) {
    return Date.now() + FIFTEEN_DAYS_MS;
  }

  return new Date(targetDate || Date.now()).getTime();
}

const CountdownTimer = ({ targetDate, className = "" }) => {
  const initialTarget = resolveTarget(targetDate);
  const targetRef = useRef(initialTarget);
  const isRollingTarget = targetDate === ROLLING_COUNTDOWN_TARGET;
  const [time, setTime] = useState(() =>
    isRollingTarget
      ? { days: 15, hours: 0, minutes: 0, seconds: 0, done: false }
      : getRemaining(initialTarget)
  );

  useEffect(() => {
    targetRef.current = resolveTarget(targetDate);

    // Sync immediately after hydration so the initial 15-day placeholder is
    // replaced by the exact remaining time without a hydration mismatch.
    const syncId = setTimeout(
      () => setTime(getRemaining(targetRef.current)),
      0
    );
    const intervalId = setInterval(
      () => setTime(getRemaining(targetRef.current)),
      1000
    );

    return () => {
      clearTimeout(syncId);
      clearInterval(intervalId);
    };
  }, [targetDate]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className={`neu-countdown flex items-stretch justify-center ${className}`}>
      {units.map((unit, i) => (
        <div
          key={unit.label}
          className={`flex w-[4.35rem] flex-col items-center justify-center py-3 sm:w-[4.8rem] ${
            i < units.length - 1 ? "border-r border-[#dadce0]" : ""
          }`}
        >
            <span
              className="text-2xl font-bold tabular-nums leading-none sm:text-3xl"
              style={{ color: COLORS[i] }}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f6368]">
              {unit.label}
            </span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
