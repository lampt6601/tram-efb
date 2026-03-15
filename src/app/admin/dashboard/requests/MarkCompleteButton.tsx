"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkCompleteButton({
  id,
  completed,
}: {
  id: string;
  completed: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleToggle = async () => {
    setLoading(true);
    await supabase
      .from("account_requests")
      .update({ completed: !completed })
      .eq("id", id);
    setLoading(false);
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      loading={loading}
      loadingLabel={completed ? "Đang bỏ đánh dấu..." : "Đang đánh dấu..."}
      className="gap-1.5"
    >
      {completed ? (
        <>
          <Circle className="h-3.5 w-3.5" />
          Bỏ hoàn tất
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5" />
          Đánh dấu hoàn tất
        </>
      )}
    </Button>
  );
}
