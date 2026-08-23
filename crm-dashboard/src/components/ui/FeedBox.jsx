// FeedBox.jsx — matches the HTML feed-panel layout exactly
import { useState, useEffect, useRef } from 'react';

const DOT_COLORS = {
  red: '#dc2626',
  amber: '#d97706',
  green: '#16a34a',
  blue: '#2563eb',
  purple: '#7c3aed',
};

export function FeedBox({
  title = 'Live Incident Feed',
  items = [],
  liveEvents = [],
  autoInterval = null,
  maxItems = 15,
  onSimulate,
  showSimulate = true,
}) {
  const [feed, setFeed] = useState(items);
  const feedIdx = useRef(0);

  const addEvent = (event) => {
    const now = new Date();
    const ts = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setFeed((prev) =>
      [{ ...event, id: Date.now(), time: ts }, ...prev].slice(0, maxItems)
    );
  };

  useEffect(() => {
    if (!autoInterval || !liveEvents.length) return;
    const timer = setInterval(() => {
      const ev = liveEvents[feedIdx.current % liveEvents.length];
      feedIdx.current++;
      addEvent(ev);
    }, autoInterval);
    return () => clearInterval(timer);
  }, [autoInterval, liveEvents]);

  const handleSimulate = () => {
    if (onSimulate) { onSimulate(); return; }
    if (!liveEvents.length) return;
    const ev = liveEvents[feedIdx.current % liveEvents.length];
    feedIdx.current++;
    addEvent(ev);
  };

  return (
    /*
      wrapper-card normally does: flex items-start gap-3.5 px-5 py-4
      We override to: flex-col items-stretch gap-0 p-0
      so header stacks above the feed list vertically
    */
    <div className="wrapper-card !flex-col !items-stretch !gap-0 !p-0 overflow-hidden">

      {/* ── Header — mirrors .feed-hd ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#fafbfc] shrink-0">
        <div className="flex items-center gap-1.5 text-[13px] text-gray-800">
          {/* pulsing live dot */}
          <span className="w-[7px] h-[7px] rounded-full bg-red-500 shrink-0 animate-pulse" />
          {title}
        </div>

        {showSimulate && (
          <button
            onClick={handleSimulate}
            className="text-xs font-normal px-3 py-1 rounded border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-all"
          >
            Simulate
          </button>
        )}
      </div>

      {/* ── Feed list — mirrors .feed-body ── */}
      <div className="overflow-y-auto flex-1 max-h-[calc(100vh-220px)]">
        {feed.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-400 text-xs">
            No incidents yet
          </div>
        ) : (
          feed.map((item) => <FeedItem key={item.id} {...item} />)
        )}
      </div>

    </div>
  );
}

// ── FeedItem — mirrors .feed-item ─────────────────────────
function FeedItem({ dot, api, msg, time }) {
  const color = DOT_COLORS[dot] ?? dot;

  return (
    /*
      wrapper-card gives: flex items-start gap-3.5 px-5 py-4 rounded-xl border ...
      We override padding, radius, border to match .feed-item exactly:
        padding: 10px 14px, border-bottom only, no radius
      wrapper-card's flex + items-start + gap are perfect for the row layout — keep them
    */
    <div className="wrapper-card !rounded-none !border-0 !border-b !border-gray-100 !px-3.5 !py-2.5 !gap-2.5 hover:bg-[#f5f7ff] cursor-pointer transition-colors last:!border-b-0">

      {/* Colored status dot — mirrors .feed-dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0 mt-1"
        style={{ background: color }}
      />

      {/* Text block — mirrors .feed-text */}
      <div className="flex-1 min-w-0">
        {/* API name — mirrors .feed-api */}
        <div className="text-[12.5px] font-medium text-gray-800 leading-tight">
          {api}
        </div>
        {/* Message — mirrors .feed-msg */}
        <div className="text-[11.5px] text-gray-500 mt-0.5 leading-snug">
          {msg}
        </div>
      </div>

      {/* Timestamp — mirrors .feed-time */}
      <div className="text-[10.5px] text-gray-300 whitespace-nowrap shrink-0 mt-0.5 tabular-nums">
        {time}
      </div>

    </div>
  );
}

export default FeedBox;