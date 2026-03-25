"use client";

import { useState, useTransition } from "react";
import type { Chore, FamilyMember, User } from "@/types";
import { createChore, updateChore, deleteChore } from "@/actions/chores";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ChoreFormProps {
  chore?: Chore;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: (FamilyMember & { user: User })[];
}

export function ChoreForm({
  chore,
  open,
  onOpenChange,
  members,
}: ChoreFormProps) {
  const isEditing = !!chore;
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(chore?.title ?? "");
  const [description, setDescription] = useState(chore?.description ?? "");
  const [assignedTo, setAssignedTo] = useState(chore?.assigned_to ?? "none");
  const [recurrence, setRecurrence] = useState(
    chore?.recurrence_rule ?? "none"
  );
  const [points, setPoints] = useState(chore?.points ?? 1);

  function resetForm() {
    setTitle("");
    setDescription("");
    setAssignedTo("none");
    setRecurrence("none");
    setPoints(1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set(
      "assigned_to",
      assignedTo === "none" ? "" : assignedTo
    );
    formData.set(
      "recurrence_rule",
      recurrence === "none" ? "" : recurrence
    );
    formData.set("points", String(points));

    startTransition(async () => {
      if (isEditing && chore) {
        await updateChore(chore.id, formData);
      } else {
        await createChore(formData);
      }
      resetForm();
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!chore) return;
    startTransition(async () => {
      await deleteChore(chore.id);
      resetForm();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Chore" : "New Chore"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="chore-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="chore-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chore title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="chore-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="chore-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned to</label>
            <Select value={assignedTo} onValueChange={(v) => v && setAssignedTo(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Recurrence</label>
            <Select value={recurrence} onValueChange={(v) => v && setRecurrence(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="chore-points" className="text-sm font-medium">
              Points
            </label>
            <Input
              id="chore-points"
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update Chore"
                  : "Create Chore"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
