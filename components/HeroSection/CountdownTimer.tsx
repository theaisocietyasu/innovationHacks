import React, { useState, useEffect } from "react";

const CountdownTimer = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const setTime = (time: { days: number; hours: number; minutes: number; seconds: number }) => {
    setDays(time.days);
    setHours(time.hours);
    setMinutes(time.minutes);
    setSeconds(time.seconds);
  };

  const calculateTimeRemaining = (endDate: Date) => {
    const difference = endDate.getTime() - Date.now();

    if (difference > 0) {
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTime({ days: d, hours: h, minutes: m, seconds: s });
    } else {
      setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  useEffect(() => {
    const endDate = new Date("2026-04-03T09:00:00-07:00"); // April 3rd 2026, Arizona time
    const intervalId = setInterval(() => {
      calculateTimeRemaining(endDate);
    }, 1000);

    calculateTimeRemaining(endDate);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="glass-countdown-row">
      <div className="glass-countdown-unit">
        <span className="unit-value">{String(days).padStart(2, "0")}</span>
        <span className="unit-label">Days</span>
      </div>
      <div className="glass-countdown-unit">
        <span className="unit-value">{String(hours).padStart(2, "0")}</span>
        <span className="unit-label">Hours</span>
      </div>
      <div className="glass-countdown-unit">
        <span className="unit-value">{String(minutes).padStart(2, "0")}</span>
        <span className="unit-label">Mins</span>
      </div>
      <div className="glass-countdown-unit">
        <span className="unit-value">{String(seconds).padStart(2, "0")}</span>
        <span className="unit-label">Secs</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
