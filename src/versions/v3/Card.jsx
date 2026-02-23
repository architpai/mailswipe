import React, { useState, useEffect, useRef } from 'react';
import { getActionLabel } from '../../hooks/useSettings';

// Tag with loading spinner + twang animation when generation completes
function MlTagBadge({ mlTag }) {
  const [animate, setAnimate] = useState(false);
  const mountedAt = useRef(Date.now());
  const prevTag = useRef(null);

  useEffect(() => {
    if (mlTag && !prevTag.current) {
      // Tag just arrived — check if generation took > 500ms
      const elapsed = Date.now() - mountedAt.current;
      if (elapsed > 500) {
        setAnimate(true);
        const timer = setTimeout(() => setAnimate(false), 400);
        return () => clearTimeout(timer);
      }
    }
    prevTag.current = mlTag;
  }, [mlTag]);

  // Loading state — static grey square with a black line tracing its perimeter
  if (!mlTag) {
    const size = 12;
    const stroke = 2;
    const perim = (size - stroke) * 4;
    const seg = perim * 0.3; // visible line length
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        {/* Static grey square */}
        <rect
          x={stroke / 2} y={stroke / 2}
          width={size - stroke} height={size - stroke}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={stroke}
        />
        {/* Animated black line tracing the perimeter */}
        <rect
          x={stroke / 2} y={stroke / 2}
          width={size - stroke} height={size - stroke}
          stroke="black"
          strokeWidth={stroke}
          strokeDasharray={`${seg} ${perim - seg}`}
          style={{ animation: 'perimeterTrace 1.2s linear infinite' }}
        />
        <style>{`
          @keyframes perimeterTrace {
            to { stroke-dashoffset: -${perim}px; }
          }
        `}</style>
      </svg>
    );
  }

  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 bg-black text-white uppercase tracking-tight font-mono"
      style={{
        animation: animate ? 'tagTwang 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}
    >
      {mlTag.toUpperCase()}
      <style>{`
        @keyframes tagTwang {
          0% { transform: scale(1); }
          30% { transform: scale(1.15) rotate(-2deg); }
          60% { transform: scale(0.95) rotate(1deg); }
          100% { transform: scale(1) rotate(0); }
        }
      `}</style>
    </span>
  );
}

function PredictionPills({ predictions, settings, modelReady }) {
  if (!predictions || !settings) return null;

  // Before model is ready, show learning indicator
  if (!modelReady) {
    return (
      <div className="flex items-center justify-center mb-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30 font-mono">
          LEARNING...
        </span>
      </div>
    );
  }

  const directions = ['left', 'up', 'right'];

  // Find highest confidence direction
  const maxDir = directions.reduce((a, b) =>
    (predictions[a] || 0) > (predictions[b] || 0) ? a : b
  );

  const getAbbrev = (actionConfig) =>
    getActionLabel(actionConfig).substring(0, 3).toUpperCase();

  return (
    <div className="flex items-center gap-1.5 mb-3">
      {directions.map(dir => {
        const actionConfig = settings.swipeActions[dir];
        const confidence = predictions[dir] || 0;
        const isMax = dir === maxDir;
        const pct = Math.round(confidence * 100);

        return (
          <div
            key={dir}
            className="flex items-center gap-1 px-1.5 py-0.5 font-mono"
            style={{
              backgroundColor: actionConfig.color + (isMax ? '20' : '10'),
              border: `1.5px solid ${actionConfig.color}${isMax ? '60' : '25'}`,
              opacity: isMax ? 1 : 0.6,
            }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-tight"
              style={{ color: actionConfig.color }}
            >
              {getAbbrev(actionConfig)}
            </span>
            <span
              className="text-[9px] font-black tabular-nums"
              style={{ color: actionConfig.color }}
            >
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

const CONFIDENCE_THRESHOLD = 0.8;
const MAX_TINT_OPACITY = 0.12;

// Blend a hex color with white at a given opacity, returning an opaque hex color.
// This avoids transparency which would show stacked cards behind.
function blendWithWhite(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const blendR = Math.round(r * opacity + 255 * (1 - opacity));
  const blendG = Math.round(g * opacity + 255 * (1 - opacity));
  const blendB = Math.round(b * opacity + 255 * (1 - opacity));
  return `rgb(${blendR}, ${blendG}, ${blendB})`;
}

function computeTintColor(predictions, settings) {
  if (!predictions || !settings) return null;
  const directions = ['left', 'up', 'right'];
  let maxDir = directions[0];
  let maxConf = predictions[directions[0]] || 0;
  for (const dir of directions) {
    const conf = predictions[dir] || 0;
    if (conf > maxConf) {
      maxConf = conf;
      maxDir = dir;
    }
  }
  if (maxConf < CONFIDENCE_THRESHOLD) return null;
  const opacity = ((maxConf - CONFIDENCE_THRESHOLD) / (1 - CONFIDENCE_THRESHOLD)) * MAX_TINT_OPACITY;
  const color = settings.swipeActions[maxDir].color;
  return blendWithWhite(color, opacity);
}

export default function Card({ email, isTop, onUnsubscribe, predictions, settings, modelReady }) {
  if (!email) return null;

  const { from, subject, date, snippet, mlTag, mlSummary, unsubscribeLink } = email;

  // Extract initials for the sender badge
  const senderName = from?.name || from?.email || '?';
  const initials = senderName
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();

  const tintColor = isTop ? computeTintColor(predictions, settings) : null;

  return (
    <div
      className={`w-full h-full border-[3px] border-black rounded-none shadow-none p-5 flex flex-col justify-between overflow-hidden font-mono
        ${isTop ? '' : 'opacity-80'}`}
      style={{ backgroundColor: tintColor || '#ffffff' }}
    >
      <div>
        {/* Prediction confidence pills — only on top card */}
        {isTop && predictions && settings?.showDebugPills && (
          <PredictionPills predictions={predictions} settings={settings} modelReady={modelReady} />
        )}

        {/* Sender row — prominent, with initial badge */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-none w-9 h-9 border-[2px] border-black flex items-center justify-center bg-black text-white text-xs font-black tracking-tight">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-black text-black text-sm uppercase tracking-tight truncate">
                {senderName}
              </h3>
              <MlTagBadge mlTag={mlTag} />
            </div>
            {from?.email && from.name && (
              <div className="mt-0.5">
                <span className="text-[9px] text-black/30 uppercase tracking-wider truncate">
                  {from.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Thin separator */}
        <div className="border-t border-black/10 mb-3" />

        <h2 className="text-base font-bold text-black mb-2 line-clamp-2 leading-tight font-mono uppercase tracking-tight">
          {subject}
        </h2>

        <p className="text-black/60 text-xs mb-3 line-clamp-4 font-mono leading-relaxed">
          {mlSummary || snippet || 'No snippet available.'}
        </p>
      </div>

      {/* Date + footer — pinned to bottom */}
      <div className="mt-auto">
        <div className="flex justify-end mb-2">
          <span className="text-[11px] text-black/70 uppercase tracking-wider font-mono font-bold">{date}</span>
        </div>
        <div className="text-[10px] text-black flex justify-between items-center border-t-[2px] border-black pt-2 font-mono uppercase tracking-wider">
          {unsubscribeLink && onUnsubscribe && (
            <button
              className="text-[#ff0000] font-bold bg-transparent border-none cursor-pointer font-mono text-[10px] uppercase tracking-wider p-0 hover:underline"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onUnsubscribe(email); }}
            >
              UNSUB
            </button>
          )}
          <span className="ml-auto text-black/40">SPACE / HOLD TO VIEW</span>
        </div>
      </div>
    </div>
  );
}
