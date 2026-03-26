"use client";

import { useState, useTransition } from "react";
import { createSharedList } from "@/actions/lists";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ListFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEMPLATES = [
  { value: "packing", label: "Packing List" },
  { value: "school_supplies", label: "School Supplies" },
  { value: "party_planning", label: "Party Planning" },
];

export function ListForm({ open, onOpenChange }: ListFormProps) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.set("name", name);

    startTransition(async () => {
      const result = await createSharedList(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("List created");
        setName("");
        onOpenChange(false);
        if (result.id) router.push(`/lists/${result.id}`);
      }
    });
  }

  function handleTemplate(template: { value: string; label: string }) {
    const formData = new FormData();
    formData.set("name", template.label);
    formData.set("template", template.value);

    startTransition(async () => {
      const result = await createSharedList(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("List created");
        onOpenChange(false);
        if (result.id) router.push(`/lists/${result.id}`);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Quick templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <Button
                  key={t.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplate(t)}
                  disabled={isPending}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or custom
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="List name"
              required
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending || !name.trim()}>
                {isPending ? "Creating..." : "Create List"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
