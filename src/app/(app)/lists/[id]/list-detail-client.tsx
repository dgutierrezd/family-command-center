"use client";

import { useTransition } from "react";
import { archiveSharedList, deleteSharedList } from "@/actions/lists";
import { Button } from "@/components/ui/button";
import { Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ListDetailClientProps {
  listId: string;
  archived: boolean;
}

export function ListDetailClient({ listId, archived }: ListDetailClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleArchive() {
    startTransition(async () => {
      await archiveSharedList(listId);
      toast.success("List archived");
      router.push("/lists");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSharedList(listId);
      toast.success("List deleted");
      router.push("/lists");
    });
  }

  return (
    <div className="flex gap-1">
      {!archived && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleArchive}
          disabled={isPending}
          title="Archive list"
        >
          <Archive className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        title="Delete list"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
