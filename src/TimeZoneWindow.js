import React from 'react';
import { useState, useEffect } from "react";

const TIMEZONES = [
   {
      key: "IST",
      label: "India",
      city: "Banglore",
      tz: "Asia/Kolkata",
      accent: "#E8500A",
      lightAccent: "#FFF0E8",
      flag: "🇮🇳",
   },
   {
      key: "CET",
      label: "Europe",
      city: "France",
      tz: "Europe/Berlin",
      accent: "#002395",
      lightAccent: "#E8EEF8",
      flag: "🇫🇷",
      dynamicKey: true,
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
      city: "California",
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
   const hours = parseInt(get("hour"));
   const minutes = parseInt(get("minute"));
   const seconds = parseInt(get("second"));
   return {
      hours,
      minutes,
      seconds,
      hours12: hours % 12 || 12,
      ampm: hours >= 12 ? "PM" : "AM",
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

function getTimezoneAbbr(tz) {
   const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date());
   return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
}

function getTimeForSliderValue(tz, sourceTz, sourceHours, sourceMinutes) {
   const now = new Date();
   const srcFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: sourceTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
   });
   const srcParts = srcFormatter.formatToParts(now);
   const getSrc = (type) => srcParts.find((p) => p.type === type)?.value ?? "";
   const year = parseInt(getSrc("year"));
   const month = parseInt(getSrc("month")) - 1;
   const day = parseInt(getSrc("day"));

   // Compute source timezone's UTC offset dynamically
   const refDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
   const srcLocal = new Date(refDate.toLocaleString("en-US", { timeZone: sourceTz }));
   const utcLocal = new Date(refDate.toLocaleString("en-US", { timeZone: "UTC" }));
   const offsetMs = srcLocal - utcLocal;
   const offsetHours = Math.floor(offsetMs / 3600000);
   const offsetMinutes = Math.floor((offsetMs % 3600000) / 60000);

   const utcDate = new Date(Date.UTC(year, month, day, sourceHours - offsetHours, sourceMinutes - offsetMinutes, 0));

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
   const parts = formatter.formatToParts(utcDate);
   const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
   const hours = parseInt(get("hour"));
   const minutes = parseInt(get("minute"));
   const seconds = parseInt(get("second"));
   return {
      hours,
      minutes,
      seconds,
      hours12: hours % 12 || 12,
      ampm: hours >= 12 ? "PM" : "AM",
      timeStr: `${get("hour")}:${get("minute")}:${get("second")}`,
      dateStr: `${get("weekday")}, ${get("day")} ${get("month")}`,
   };
}

function useIsMobile() {
   const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 520);
   useEffect(() => {
      const handler = () => setIsMobile(window.innerWidth <= 520);
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
   }, []);
   return isMobile;
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

function TimeCard({ zone, time, isMobile }) {
   const offset = getOffsetLabel(zone.tz);
   const displayKey = zone.dynamicKey ? getTimezoneAbbr(zone.tz) : zone.key;
   const isDaytime = time.hours >= 6 && time.hours < 20;
   const periodIcon = isDaytime ? "☀️" : "🌙";

   return (
      <div
         style={{
            background: "#ffffff",
            border: `2px solid ${zone.accent}22`,
            borderLeft: `6px solid ${zone.accent}`,
            borderRadius: 20,
            padding: isMobile ? "16px 18px" : "26px 36px",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 14 : 20,
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
               <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
                  <span style={{ fontSize: isMobile ? 22 : 30 }}>{zone.flag}</span>
                  <span
                     style={{
                        fontSize: isMobile ? 18 : 24,
                        fontWeight: 900,
                        color: zone.accent,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'Courier New', monospace",
                     }}
                  >
                     {displayKey}
                  </span>
                  <span
                     style={{
                        fontSize: isMobile ? 11 : 13,
                        color: "#fff",
                        background: zone.accent,
                        padding: isMobile ? "3px 8px" : "4px 12px",
                        borderRadius: 20,
                        fontFamily: "monospace",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                     }}
                  >
                     {offset}
                  </span>
               </div>
               <div style={{ fontSize: isMobile ? 13 : 16, color: "#334155", fontFamily: "monospace", fontWeight: 700 }}>
                  {zone.city} · {zone.label}
               </div>
            </div>
            <ClockFace time={time} accent={zone.accent} size={isMobile ? 70 : 92} />
         </div>

         {/* Digital Time */}
         <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", zIndex: 1 }}>
            {/* 12-hour row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: isMobile ? 4 : 6, flexWrap: "nowrap" }}>
               <span
                  style={{
                     fontSize: isMobile ? 46 : 68,
                     fontWeight: 900,
                     fontFamily: "'Courier New', monospace",
                     color: "#0f172a",
                     letterSpacing: isMobile ? "-2px" : "-3px",
                     lineHeight: 1,
                  }}
               >
                  {String(time.hours12).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}
               </span>
               <span
                  style={{
                     fontSize: isMobile ? 22 : 30,
                     fontFamily: "monospace",
                     fontWeight: 800,
                     color: zone.accent,
                     lineHeight: 1,
                     marginBottom: 4,
                  }}
               >
                  :{String(time.seconds).padStart(2, "0")}
               </span>
               <div style={{ marginLeft: isMobile ? 6 : 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, alignSelf: "center" }}>
                  <span style={{ fontSize: isMobile ? 16 : 22 }}>{periodIcon}</span>
                  <span
                     style={{
                        fontSize: isMobile ? 20 : 32,
                        fontWeight: 900,
                        fontFamily: "'Courier New', monospace",
                        color: time.ampm === "AM" ? "#000000" : "#ffffff",
                        background: time.ampm === "AM" ? "#ffffff" : "#000000",
                        border: "2.5px solid #000000",
                        padding: isMobile ? "6px 12px" : "10px 22px",
                        borderRadius: 999,
                        letterSpacing: "0.12em",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                     }}
                  >
                     {time.ampm}
                  </span>
               </div>
            </div>
            {/* 24-hour row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <span
                  style={{
                     fontSize: 12,
                     fontWeight: 800,
                     fontFamily: "monospace",
                     color: "#94a3b8",
                     letterSpacing: "0.12em",
                     textTransform: "uppercase",
                  }}
               >
                  24H
               </span>
               <span
                  style={{
                     fontSize: isMobile ? 20 : 28,
                     fontWeight: 800,
                     fontFamily: "'Courier New', monospace",
                     color: zone.accent,
                     letterSpacing: "-1px",
                     lineHeight: 1,
                  }}
               >
                  {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}
               </span>
               <span
                  style={{
                     fontSize: isMobile ? 13 : 16,
                     fontFamily: "monospace",
                     fontWeight: 700,
                     color: "#94a3b8",
                     lineHeight: 1,
                  }}
               >
                  :{String(time.seconds).padStart(2, "0")}
               </span>
            </div>
         </div>

         {/* Date Badge */}
         <div
            style={{
               fontSize: isMobile ? 13 : 15,
               color: zone.accent,
               fontFamily: "monospace",
               fontWeight: 800,
               background: zone.lightAccent,
               border: `1.5px solid ${zone.accent}44`,
               padding: isMobile ? "5px 12px" : "7px 16px",
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
            <div style={{ fontSize: 12, color: "#334155", fontWeight: 800, marginBottom: 8, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em" }}>
               24-Hour Window
            </div>
            <Bar24 hours={time.hours} minutes={time.minutes} accent={zone.accent} lightAccent={zone.lightAccent} />
         </div>
      </div>
   );
}

function SliderSection({ isMobile }) {
   const [activeZoneKey, setActiveZoneKey] = useState("IST");
   const activeZone = TIMEZONES.find((z) => z.key === activeZoneKey);

   const [sliderValue, setSliderValue] = useState(() => {
      const nowTime = getTimeInZone(activeZone.tz);
      return nowTime.hours * 2 + (nowTime.minutes >= 30 ? 1 : 0);
   });

   const handleZoneSwitch = (key) => {
      const zone = TIMEZONES.find((z) => z.key === key);
      const nowTime = getTimeInZone(zone.tz);
      setActiveZoneKey(key);
      setSliderValue(nowTime.hours * 2 + (nowTime.minutes >= 30 ? 1 : 0));
   };

   const sourceHours = Math.floor(sliderValue / 2);
   const sourceMinutes = (sliderValue % 2) * 30;
   const sliderTimes = TIMEZONES.reduce(
      (acc, z) => ({ ...acc, [z.key]: getTimeForSliderValue(z.tz, activeZone.tz, sourceHours, sourceMinutes) }),
      {}
   );
   const formattedTime = `${String(sourceHours).padStart(2, "0")}:${String(sourceMinutes).padStart(2, "0")}`;

   return (
      <div style={{ width: "100%", marginTop: isMobile ? 32 : 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
         {/* Header */}
         <div style={{ marginBottom: isMobile ? 18 : 28, textAlign: "center", padding: "0 16px" }}>
            <div
               style={{
                  fontSize: isMobile ? 11 : 14,
                  letterSpacing: "0.3em",
                  color: "#64748b",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontWeight: 800,
                  fontFamily: "'Courier New', monospace",
               }}
            >
               Time Explorer
            </div>
            <h2
               style={{
                  margin: 0,
                  fontSize: isMobile ? 22 : 30,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-1px",
                  fontFamily: "'Courier New', monospace",
               }}
            >
               Slide to Explore
            </h2>
            {/* Timezone toggle buttons */}
            <div style={{ marginTop: 12, display: "flex", gap: isMobile ? 6 : 10, justifyContent: "center", flexWrap: "wrap" }}>
               {TIMEZONES.map((z) => {
                  const isActive = z.key === activeZoneKey;
                  return (
                     <button
                        key={z.key}
                        onClick={() => handleZoneSwitch(z.key)}
                        style={{
                           display: "flex",
                           alignItems: "center",
                           gap: 6,
                           padding: isMobile ? "6px 12px" : "8px 18px",
                           borderRadius: 10,
                           border: `2px solid ${isActive ? z.accent : z.accent + "44"}`,
                           background: isActive ? z.lightAccent : "#ffffff",
                           cursor: "pointer",
                           fontFamily: "'Courier New', monospace",
                           fontWeight: 800,
                           fontSize: isMobile ? 13 : 15,
                           color: isActive ? z.accent : "#64748b",
                           transition: "all 0.2s ease",
                           boxShadow: isActive ? `0 2px 10px ${z.accent}33` : "none",
                        }}
                     >
                        <span style={{ fontSize: isMobile ? 14 : 18 }}>{z.flag}</span>
                        {z.dynamicKey ? getTimezoneAbbr(z.tz) : z.key}
                     </button>
                  );
               })}
            </div>

            {/* Active timezone time badge */}
            <div
               style={{
                  marginTop: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: activeZone.lightAccent,
                  border: `2px solid ${activeZone.accent}44`,
                  borderRadius: 12,
                  padding: isMobile ? "6px 14px" : "8px 20px",
               }}
            >
               <span style={{ fontSize: isMobile ? 16 : 20 }}>{activeZone.flag}</span>
               <span
                  style={{
                     fontSize: isMobile ? 18 : 24,
                     fontWeight: 900,
                     fontFamily: "'Courier New', monospace",
                     color: activeZone.accent,
                     letterSpacing: "-1px",
                  }}
               >
                  {activeZone.dynamicKey ? getTimezoneAbbr(activeZone.tz) : activeZoneKey} {formattedTime}
               </span>
            </div>
         </div>

         {/* Slider */}
         <div style={{ width: "100%", maxWidth: 600, padding: "0 28px", boxSizing: "border-box", marginBottom: isMobile ? 20 : 28 }}>
            <input
               type="range"
               min={0}
               max={47}
               value={sliderValue}
               onChange={(e) => setSliderValue(parseInt(e.target.value))}
               style={{
                  width: "100%",
                  height: 8,
                  cursor: "pointer",
                  accentColor: activeZone.accent,
                  borderRadius: 4,
               }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
               {["00:00", "06:00", "12:00", "18:00", "23:30"].map((label) => (
                  <span
                     key={label}
                     style={{
                        fontSize: 12,
                        color: "#64748b",
                        fontFamily: "monospace",
                        fontWeight: 700,
                     }}
                  >
                     {label}
                  </span>
               ))}
            </div>
         </div>

         {/* Cards */}
         {isMobile ? (
            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  width: "100%",
                  padding: "0 14px",
                  boxSizing: "border-box",
               }}
            >
               {TIMEZONES.map((zone) => (
                  <TimeCard key={zone.key} zone={zone} time={sliderTimes[zone.key]} isMobile={isMobile} />
               ))}
            </div>
         ) : (
            <div
               style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 22,
                  width: "100%",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  justifyContent: "center",
                  padding: "8px 28px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  boxSizing: "border-box",
               }}
            >
               {TIMEZONES.map((zone) => (
                  <div key={zone.key} style={{ flex: "0 0 auto", width: "min(90vw, 520px)", scrollSnapAlign: "center" }}>
                     <TimeCard zone={zone} time={sliderTimes[zone.key]} isMobile={isMobile} />
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

export default function TimeZoneWindow() {
   const isMobile = useIsMobile();
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
            padding: isMobile ? "28px 0" : "48px 28px",
            fontFamily: "'Courier New', monospace",
            boxSizing: "border-box",
         }}
      >
         {/* Title */}
         <div style={{ marginBottom: isMobile ? 24 : 40, textAlign: "center", padding: "0 16px" }}>
            <div
               style={{
                  fontSize: isMobile ? 11 : 14,
                  letterSpacing: "0.3em",
                  color: "#64748b",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontWeight: 800,
               }}
            >
               Global Time Window
            </div>
            <h1
               style={{
                  margin: 0,
                  fontSize: isMobile ? 26 : 36,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-1.5px",
               }}
            >
               24 — Hour Sync
            </h1>
            <div style={{ fontSize: isMobile ? 12 : 14, color: "#64748b", marginTop: 6, fontWeight: 700 }}>
               🔴 Live · Updates every second
            </div>
         </div>

         {/* Cards */}
         {isMobile ? (
            /* Mobile: vertical stack */
            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  width: "100%",
                  padding: "0 14px",
                  boxSizing: "border-box",
               }}
            >
               {TIMEZONES.map((zone) => (
                  <TimeCard key={zone.key} zone={zone} time={times[zone.key]} isMobile={isMobile} />
               ))}
            </div>
         ) : (
            /* Desktop: horizontal scroll */
            <div
               style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 22,
                  width: "100%",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  justifyContent: "center",
                  padding: "8px 28px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  boxSizing: "border-box",
               }}
            >
               {TIMEZONES.map((zone) => (
                  <div key={zone.key} style={{ flex: "0 0 auto", width: "min(90vw, 520px)", scrollSnapAlign: "center" }}>
                     <TimeCard zone={zone} time={times[zone.key]} isMobile={isMobile} />
                  </div>
               ))}
            </div>
         )}

         {/* Time Slider Explorer */}
         <SliderSection isMobile={isMobile} />
      </div>
   );
}