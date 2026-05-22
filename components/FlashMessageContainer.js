"use client";

import { useEffect, useState } from "react";

export default function FlashMessageContainer() {
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    // Read flash cookie on client side
    const getCookie = (name) => {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="));
      return match ? decodeURIComponent(match.split("=")[1]) : null;
    };

    const flashValue = getCookie("flash");
    if (flashValue) {
      try {
        const parsed = JSON.parse(flashValue);
        setFlash(parsed);

        // Delete the cookie after reading
        document.cookie = "flash=; path=/; max-age=0";

        // Auto-hide after 4 seconds
        setTimeout(() => setFlash(null), 4000);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  if (!flash) return null;

  const styles = {
    success: {
      bg: "bg-green-100 border-green-500 text-green-800",
      icon: "✅",
    },
    error: {
      bg: "bg-red-100 border-red-500 text-red-800",
      icon: "❌",
    },
    warning: {
      bg: "bg-yellow-100 border-yellow-500 text-yellow-800",
      icon: "⚠️",
    },
  };

  const style = styles[flash.type] || styles.success;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-5 py-3 rounded-lg border-l-4 shadow-lg text-sm font-medium max-w-sm ${style.bg}`}
      role="alert"
    >
      <span>{style.icon}</span>
      <span>{flash.message}</span>
      <button
        onClick={() => setFlash(null)}
        className="ml-auto text-lg leading-none opacity-60 hover:opacity-100"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}