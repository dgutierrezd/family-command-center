"use client";

import { useTransition } from "react";
import { toggleListItem, deleteListItem } from "@/actions/lists";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { SharedListItem } from "@/types";

interface ListItemRowProps {
  item: SharedListItem;
}

export function ListItemRow({ item }: ListItemRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleListItem(item.id, checked);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteListItem(item.id);
    });
  }

  return (
    <div className="flex items-center gap-3 py-2 group">
      <Checkbox
        checked={item.checked}
        onCheckedChange={(checked) => handleToggle(!!checked)}
        disabled={isPending}
      />
      <span
        className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}
      >
        {item.name}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity size-7 p-0"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
