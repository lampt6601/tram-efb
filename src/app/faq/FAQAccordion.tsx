"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQAccordionProps {
  question: string;
  answer: string;
  isLast?: boolean;
}

export function FAQAccordion({
  question,
  answer,
  isLast = false,
}: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`border-b border-slate-200 dark:border-slate-700 ${isLast ? "border-b-0" : ""}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors duration-150 flex items-start justify-between gap-4 dark:hover:bg-slate-800"
      >
        <span className="font-semibold text-slate-900 text-base leading-relaxed dark:text-slate-100">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-600 flex-shrink-0 transition-transform duration-300 dark:text-slate-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-6 pb-4 bg-slate-50/50 border-t border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap dark:text-slate-400">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
