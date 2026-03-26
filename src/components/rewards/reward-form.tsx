"use client";

import { useState, useTransition } from "react";
import { createReward, updateReward, deleteReward } from "@/actions/rewards";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Reward } from "@/types";

interface RewardFormProps {
  reward?: Reward;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RewardForm({ reward, open, onOpenChange }: RewardFormProps) {
  const isEditing = !!reward;
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(reward?.name ?? "");
  const [description, setDescription] = useState(reward?.description ?? "");
  const [pointsCost, setPointsCost] = useState(reward?.points_cost ?? 50);

  function resetForm() {
    setName("");
    setDescription("");
    setPointsCost(50);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("points_cost", String(pointsCost));

    startTransition(async () => {
      const result = isEditing
        ? await updateReward(reward!.id, formData)
        : await createReward(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Reward updated" : "Reward created");
        resetForm();
        onOpenChange(false);
      }
    });
  }

  function handleDelete() {
    if (!reward) return;
    startTransition(async () => {
      const result = await deleteReward(reward.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Reward deleted");
        resetForm();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Reward" : "New Reward"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reward-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="reward-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "30 min screen time"'
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reward-desc" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="reward-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reward-cost" className="text-sm font-medium">
              Points Cost
            </label>
            <Input
              id="reward-cost"
              type="number"
              min={1}
              max={10000}
              value={pointsCost}
              onChange={(e) => setPointsCost(Number(e.target.value))}
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
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update Reward"
                  : "Create Reward"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
