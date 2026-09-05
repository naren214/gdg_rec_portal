"use client";

import React, { useEffect, useState } from "react";

const COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

function getRemaining(target) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: false,
  };
}

const CountdownTimer = ({ targetDate, className = "" }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });

  useEffect(() => {
    if (!targetDate) return;
    setTime(getRemaining(targetDate));
    const id = setInterval(() => setTime(getRemaining(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {units.map((unit, i) => (
        <React.Fragment key={unit.label}>
          <div className="neu-sm flex flex-col items-center justify-center w-16 h-18 sm:w-20 sm:h-20 py-2">
            <span
              className="text-2xl sm:text-3xl font-bold tabular-nums leading-none"
              style={{ color: COLORS[i] }}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#8a90a2] mt-1">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-xl font-bold text-[#c3c9d8] -mt-4">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CountdownTimer;
