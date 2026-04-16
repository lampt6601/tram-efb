"use client";

import { useState } from "react";
import { Share2, Facebook, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  accountId: string;
}

export function ShareButtons({ accountId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://sap-efb.vercel.app/accounts/${accountId}`;
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-xs text-slate-400">
        <Share2 className="inline h-3.5 w-3.5" /> Chia sẻ:
      </span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
        title="Chia sẻ lên Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
        title="Sao chép liên kết"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
