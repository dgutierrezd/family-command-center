"use client";

import { useState } from "react";
import type { Chore, FamilyMember, User, ChoreCompletion } from "@/types";
import { completeChore } from "@/actions/chores";
import { useRealtime } from "@/hooks/use-realtime";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, RotateCw, Star } from "lucide-react";

interface ChoreListProps {
  chores: (Chore & { completions?: ChoreCompletion[] })[];
  members: (FamilyMember & { user: User })[];
  familyId: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function recurrenceLabel(rule: string | null) {
  if (!rule || rule === "none") return null;
  if (rule === "daily") return "Daily";
  if (rule === "weekly") return "Weekly";
  return rule;
}

export function ChoreList({ chores, members, familyId }: ChoreListProps) {
  const [filterAssignee, setFilterAssignee] = useState("all");

  useRealtime({ table: "chore_completions", familyId });

  const filtered =
    filterAssignee === "all"
      ? chores
      : chores.filter((c) => c.assigned_to === filterAssignee);

  function getMember(userId: string | null) {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId);
  }

  async function handleComplete(choreId: string) {
    await completeChore(choreId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Filter by:
        </span>
        <Select value={filterAssignee} onValueChange={(v) => v && setFilterAssignee(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Everyone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.user_id} value={m.user_id}>
                {m.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No chores found.
        </p>
      )}

      <ul className="divide-y divide-border rounded-lg border">
        {filtered.map((chore) => {
          const todayCompletion = chore.completions?.[0] ?? null;
          const isCompleted = !!todayCompletion;
          const assigneeMember = getMember(chore.assigned_to);
          const completerMember = todayCompletion
            ? getMember(todayCompletion.completed_by)
            : null;

          return (
            <li
              key={chore.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}
                  >
                    {chore.title}
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="size-3" />
                    {chore.points}
                  </Badge>
                  {recurrenceLabel(chore.recurrence_rule) && (
                    <Badge variant="outline" className="gap-1">
                      <RotateCw className="size-3" />
                      {recurrenceLabel(chore.recurrence_rule)}
                    </Badge>
                  )}
                </div>

                {assigneeMember && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Avatar className="size-5">
                      {assigneeMember.user.avatar_url && (
                        <AvatarImage src={assigneeMember.user.avatar_url} />
                      )}
                      <AvatarFallback>
                        {getInitials(assigneeMember.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {assigneeMember.user.name}
                    </span>
                  </div>
                )}
              </div>

              {isCompleted ? (
                <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  <span>
                    {completerMember
                      ? completerMember.user.name
                      : "Completed"}
                  </span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleComplete(chore.id)}
                >
                  Done
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
