"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import { Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@thc-efb/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@thc-efb/ui/responsive-dialog";

export function DeleteEmailButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error: err } = await supabase.from("emails").delete().eq("id", id);
      if (err) throw err;
      toast.success("Đã xóa email");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger
        render={
          <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
      <ResponsiveDialogContent showCloseButton={false} className="sm:max-w-sm p-0 gap-0">
        <div className="px-5">
          <ResponsiveDialogHeader className="mb-4">
            <div className="flex h-10 w-10 shrink-0 place-items-center items-center justify-center mx-auto rounded-xl bg-red-50 dark:bg-red-500/10">
              <Mail className="h-5 w-5 text-red-600" />
            </div>
            <ResponsiveDialogTitle className="text-base font-semibold">Xóa email</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Bạn có chắc chắn muốn xóa email này? Việc này sẽ hủy liên kết nó
              khỏi bất kỳ tài khoản nào được kết nối. Hành động này không thể
              hoàn tác.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
        </div>
        <ResponsiveDialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={loading}
            loadingLabel="Đang xóa..."
            className="min-w-[7rem] bg-red-600 text-white hover:bg-red-700"
          >
            Xóa
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
