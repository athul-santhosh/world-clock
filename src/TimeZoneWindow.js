import React from 'react';
import { useState, useEffect } from "react";

const TIMEZONES = [
   {
      key: "IST",
      label: "India",
      city: "Mumbai",
      tz: "Asia/Kolkata",
      accent: "#E8500A",
      lightAccent: "#FFF0E8",
      flag: "🇮🇳",
   },
   {
      key: "BRT",
      label: "Brazil",
      city: "São Paulo",
      tz: "America/Sao_Paulo",
      accent: "#0A8A3A",
      lightAccent: "#E8F8EE",
      flag: "🇧🇷",
   },
   {
      key: "PST",
      label: "Pacific",
      city: "Los Angeles",
      tz: "America/Los_Angeles",
      accent: "#1A5FCC",
      lightAccent: "#E8F0FF",
      flag: "🇺🇸",
   },
];

function getTimeInZone(tz) {
   const now = new Date();
   const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      day: "2-digit",
      month: "short",
      weekday: "short",
   });
   const parts = formatter.formatToParts(now);
   const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
   return {
      hours: parseInt(get("hour")),
      minutes: parseInt(get("minute")),
      seconds: parseInt(get("second")),
      timeStr: `${get("hour")}:${get("minute")}:${get("second")}`,
      dateStr: `${get("weekday")}, ${get("day")} ${get("month")}`,
   };
}

function getOffsetLabel(tz) {
   const now = new Date();
   const tzOffset =
      new Date(now.toLocaleString("en-US", { timeZone: tz })) -
      new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
   const hours = Math.floor(tzOffset / 3600000);
   const mins = Math.abs(Math.floor((tzOffset % 3600000) / 60000));
   const sign = hours >= 0 ? "+" : "";
   return `UTC${sign}${hours}${mins ? `:${String(mins).padStart(2, "0")}` : ""}`;
}

function ClockFace({ time, accent, size = 88 }) {
   const { hours, minutes, seconds } = time;
   const h = hours % 12;
   const hourDeg = h * 30 + minutes * 0.5;
   const minDeg = minutes * 6 + seconds * 0.1;
   const secDeg = seconds * 6;
   const r = size / 2 - 5;
   const cx = size / 2;
   const cy = size / 2;

   const hand = (deg, len, width, color) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      const x = cx + len * Math.cos(rad);
      const y = cy + len * Math.sin(rad);
      return (
         <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth={width} strokeLinecap="round" />
      );
   };

   const ticks = Array.from({ length: 12 }, (_, i) => {
      const rad = ((i * 30 - 90) * Math.PI) / 180;
      const inner = r - 7;
      const outer = r;
      return (
         <line
            key={i}
            x1={cx + inner * Math.cos(rad)}
            y1={cy + inner * Math.sin(rad)}
            x2={cx + outer * Math.cos(rad)}
            y2={cy + outer * Math.sin(rad)}
            stroke={i % 3 === 0 ? `${accent}cc` : `${accent}55`}
            strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
         />
      );
   });

   return (
      <svg width={size} height={size}>
         <circle cx={cx} cy={cy} r={r} fill="white" stroke={`${accent}44`} strokeWidth={2} />
         {ticks}
         {hand(hourDeg, r * 0.5, 3.5, "#1a1a2e")}
         {hand(minDeg, r * 0.72, 2.5, "#1a1a2e")}
         {hand(secDeg, r * 0.82, 2, accent)}
         <circle cx={cx} cy={cy} r={4} fill={accent} />
      </svg>
   );
}

function Bar24({ hours, minutes, accent, lightAccent }) {
   const segments = Array.from({ length: 24 }, (_, i) => {
      const isActive = i < hours;
      const isCurrent = i === hours;
      return (
         <div
            key={i}
            style={{
               flex: 1,
               height: isCurrent ? 26 : 16,
               borderRadius: 3,
               backgroundColor: isActive ? `${accent}bb` : isCurrent ? accent : "#dde3ed",
               transition: "all 0.3s ease",
               alignSelf: "center",
               boxShadow: isCurrent ? `0 0 8px ${accent}88` : "none",
            }}
         />
      );
   });

   return (
      <div style={{ width: "100%" }}>
         <div style={{ display: "flex", gap: 3, alignItems: "center", height: 30 }}>
            {segments}
         </div>
         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {["0h", "6h", "12h", "18h", "24h"].map((h) => (
               <span key={h} style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", fontWeight: 700 }}>
                  {h}
               </span>
            ))}
         </div>
      </div>
   );
}

function TimeCard({ zone, time }) {
   const offset = getOffsetLabel(zone.tz);
   const isDaytime = time.hours >= 6 && time.hours < 20;
   const periodIcon = isDaytime ? "☀️" : "🌙";
   const periodLabel = isDaytime ? "Daytime" : "Nighttime";

   return (
      <div
         style={{
            background: "#ffffff",
            border: `2px solid ${zone.accent}22`,
            borderLeft: `6px solid ${zone.accent}`,
            borderRadius: 20,
            padding: "26px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: `0 4px 28px ${zone.accent}18, 0 1px 6px rgba(0,0,0,0.07)`,
            position: "relative",
            overflow: "hidden",
         }}
      >
         {/* Tinted background blob */}
         <div
            style={{
               position: "absolute",
               top: -30,
               right: -30,
               width: 180,
               height: 180,
               borderRadius: "50%",
               background: zone.lightAccent,
               pointerEvents: "none",
               zIndex: 0,
            }}
         />

         {/* Header Row */}
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 30 }}>{zone.flag}</span>
                  <span
                     style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: zone.accent,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'Courier New', monospace",
                     }}
                  >
                     {zone.key}
                  </span>
                  <span
                     style={{
                        fontSize: 13,
                        color: "#fff",
                        background: zone.accent,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontFamily: "monospace",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                     }}
                  >
                     {offset}
                  </span>
               </div>
               <div style={{ fontSize: 16, color: "#334155", fontFamily: "monospace", fontWeight: 700 }}>
                  {zone.city} · {zone.label}
               </div>
            </div>
            <ClockFace time={time} accent={zone.accent} size={92} />
         </div>

         {/* Digital Time */}
         <div style={{ display: "flex", alignItems: "baseline", gap: 6, position: "relative", zIndex: 1 }}>
            <span
               style={{
                  fontSize: 68,
                  fontWeight: 900,
                  fontFamily: "'Courier New', monospace",
                  color: "#0f172a",
                  letterSpacing: "-3px",
                  lineHeight: 1,
               }}
            >
               {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}
            </span>
            <span
               style={{
                  fontSize: 30,
                  fontFamily: "monospace",
                  fontWeight: 800,
                  color: zone.accent,
                  lineHeight: 1,
                  marginBottom: 6,
               }}
            >
               :{String(time.seconds).padStart(2, "0")}
            </span>
            <div style={{ marginLeft: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
               <span style={{ fontSize: 24 }}>{periodIcon}</span>
               <span style={{ fontSize: 12, color: "#334155", fontWeight: 800, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                  {periodLabel}
               </span>
            </div>
         </div>

         {/* Date Badge */}
         <div
            style={{
               fontSize: 15,
               color: zone.accent,
               fontFamily: "monospace",
               fontWeight: 800,
               background: zone.lightAccent,
               border: `1.5px solid ${zone.accent}44`,
               padding: "7px 16px",
               borderRadius: 10,
               display: "inline-block",
               alignSelf: "flex-start",
               letterSpacing: "0.05em",
               position: "relative",
               zIndex: 1,
            }}
         >
            📅 {time.dateStr}
         </div>

         {/* 24h Bar */}
         <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 13, color: "#334155", fontWeight: 800, marginBottom: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em" }}>
               24-Hour Window
            </div>
            <Bar24 hours={time.hours} minutes={time.minutes} accent={zone.accent} lightAccent={zone.lightAccent} />
         </div>
      </div>
   );
}

export default function TimeZoneWindow() {
   const [times, setTimes] = useState(() =>
      TIMEZONES.reduce((acc, z) => ({ ...acc, [z.key]: getTimeInZone(z.tz) }), {})
   );

   useEffect(() => {
      const tick = () =>
         setTimes(TIMEZONES.reduce((acc, z) => ({ ...acc, [z.key]: getTimeInZone(z.tz) }), {}));
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
   }, []);

   return (
      <div
         style={{
            minHeight: "100vh",
            background: "#f1f5f9",
            backgroundImage:
               "radial-gradient(circle at 15% 15%, #e0e7ff 0%, transparent 45%), radial-gradient(circle at 85% 85%, #fce7f3 0%, transparent 45%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 28px",
            fontFamily: "'Courier New', monospace",
         }}
      >
         {/* Title */}
         <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div
               style={{
                  fontSize: 14,
                  letterSpacing: "0.3em",
                  color: "#64748b",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  fontWeight: 800,
               }}
            >
               Global Time Window
            </div>
            <h1
               style={{
                  margin: 0,
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-1.5px",
               }}
            >
               24 — Hour Sync
            </h1>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 8, fontWeight: 700 }}>
               🔴 Live · Updates every second
            </div>
         </div>

         {/* Cards */}
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 22,
               width: "100%",
               maxWidth: 720,
            }}
         >
            {TIMEZONES.map((zone) => (
               <TimeCard key={zone.key} zone={zone} time={times[zone.key]} />
            ))}
         </div>
      </div>
   );
}