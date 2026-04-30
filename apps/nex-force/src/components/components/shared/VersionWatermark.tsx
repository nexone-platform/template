
import React from "react";

export function VersionWatermark() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split("T")[0];

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "NEXT-FORCE";
  const currentYear = new Date().getFullYear();

  return (
    <div className="hidden sm:block fixed bottom-2 right-4 text-[11px] text-gray-500/70 hover:text-gray-500 transition-colors z-[9999] pointer-events-none font-sans bg-white/40 dark:bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50">
      &copy; {currentYear} {appName}. All rights reserved. <span className="mx-1.5">|</span>
      <span className="font-mono font-medium">v{version}</span>
      {buildDate && <span className="ml-1 opacity-75">({buildDate})</span>}
    </div>
  );
}
