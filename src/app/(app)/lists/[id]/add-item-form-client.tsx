"use client";

import { useState, useTransition } from "react";
import { addListItem } from "@/actions/lists";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddItemFormClient({ listId }: { listId: string }) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const formData = new FormData();
    formData.set("name", name.trim());

    startTransition(async () => {
      const result = await addListItem(listId, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        setName("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add an item..."
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={isPending || !name.trim()}>
        <Plus className="size-4" />
      </Button>
    </form>
  );
}
