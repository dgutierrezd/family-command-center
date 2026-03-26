"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ListForm } from "@/components/lists/list-form";

export function ListsPageClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4 mr-1.5" />
        New List
      </Button>
      <ListForm open={open} onOpenChange={setOpen} />
    </>
  );
}
