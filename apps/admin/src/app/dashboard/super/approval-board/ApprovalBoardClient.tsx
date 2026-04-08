"use client";

import { useState, useTransition } from "react";
import { addBoardMember, removeBoardMember } from "@/app/actions/approval-board-actions";
import { Button } from "@thc-efb/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@thc-efb/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thc-efb/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@thc-efb/ui/alert-dialog";
import { UserMinus, UserPlus, Users } from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  email: string;
}

interface EligibleAdmin {
  id: string;
  name: string;
  email: string;
}

interface Props {
  members: Member[];
  eligibleAdmins: EligibleAdmin[];
}

export function ApprovalBoardClient({ members: initialMembers, eligibleAdmins: initialEligible }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [eligible, setEligible] = useState(initialEligible);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!selectedUserId) return;
    setError(null);
    startTransition(async () => {
      try {
        await addBoardMember(selectedUserId);
        const added = eligible.find((a) => a.id === selectedUserId);
        if (added) {
          setMembers((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              user_id: added.id,
              created_at: new Date().toISOString(),
              name: added.name,
              email: added.email,
            },
          ]);
          setEligible((prev) => prev.filter((a) => a.id !== selectedUserId));
          setSelectedUserId("");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi khi thêm thành viên");
      }
    });
  };

  const handleRemove = (userId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await removeBoardMember(userId);
        const removed = members.find((m) => m.user_id === userId);
        setMembers((prev) => prev.filter((m) => m.user_id !== userId));
        if (removed) {
          setEligible((prev) => [...prev, { id: removed.user_id, name: removed.name, email: removed.email }]);
        }
        setRemovingId(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi khi xóa thành viên");
        setRemovingId(null);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Current members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-emerald-600" />
            Thành Viên Hiện Tại ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có thành viên nào trong ban duyệt.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {m.name || m.email}
                    </p>
                    {m.name && (
                      <p className="text-xs text-slate-400">{m.email}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      Từ {new Date(m.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                    onClick={() => setRemovingId(m.user_id)}
                    disabled={isPending}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-indigo-600" />
            Thêm Thành Viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eligible.length === 0 ? (
            <p className="text-sm text-slate-400">Tất cả admin đã là thành viên ban duyệt.</p>
          ) : (
            <>
              <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn admin..." />
                </SelectTrigger>
                <SelectContent>
                  {eligible.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name ? `${a.name} (${a.email})` : a.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAdd}
                disabled={!selectedUserId || isPending}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm vào Ban Duyệt
              </Button>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Remove confirmation dialog */}
      <AlertDialog open={!!removingId} onOpenChange={(open) => { if (!open) setRemovingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khỏi ban duyệt?</AlertDialogTitle>
            <AlertDialogDescription>
              Thành viên này sẽ không còn quyền duyệt tài khoản nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingId && handleRemove(removingId)}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
