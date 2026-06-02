"use client";

import { withBase } from "@/lib/basePath";

/**
 * Baby Mo brand lockup: the round logo avatar + optional "Baby Mo Quiz"
 * wordmark. Visible in recordings (not hidden in recording mode) so every
 * frame carries the channel identity.
 */
export default function BabyMoLogo({
  size = 44,
  showText = true,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase("/assets/logo-96.png")}
        alt="Baby Mo"
        width={size}
        height={size}
        className="rounded-2xl shadow-md"
        style={{ width: size, height: size }}
        draggable={false}
      />
      {showText && (
        <span className="display leading-none text-stroke" style={{ fontSize: size * 0.5 }}>
          <span className="text-sunny">Baby Mo</span> <span className="text-aqua">Quiz</span>
        </span>
      )}
    </div>
  );
}
