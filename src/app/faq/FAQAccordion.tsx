"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface FAQAccordionProps {
  question: string;
  answer: string;
  isLast?: boolean;
  value: string;
}

export function FAQAccordion({
  question,
  answer,
  isLast = false,
  value,
}: FAQAccordionProps) {
  return (
    <AccordionItem
      value={value}
      className={isLast ? "border-b-0" : ""}
    >
      <AccordionTrigger className="px-6 py-4 text-base font-semibold text-slate-900 hover:bg-slate-50 hover:no-underline dark:text-slate-100 dark:hover:bg-slate-800">
        {question}
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4 bg-slate-50/50 border-t border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap dark:text-slate-400">
          {answer}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
