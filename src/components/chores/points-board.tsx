"use client";

import type { FamilyMember, User } from "@/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface PointsBoardProps {
  tally: Record<string, number>;
  members: (FamilyMember & { user: User })[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PointsBoard({ tally, members }: PointsBoardProps) {
  const ranked = members
    .map((m) => ({
      member: m,
      points: tally[m.user_id] ?? 0,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Trophy className="size-4 text-amber-500" />
        Weekly Points
      </div>

      {ranked.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6">
          <Trophy className="size-8 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Complete chores to earn points!</p>
        </div>
      )}

      <ul className="space-y-2">
        {ranked.map((entry, idx) => (
          <li
            key={entry.member.user_id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50 ${idx === 0 ? "bg-amber-50 border border-amber-200" : ""}`}
          >
            <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
              {idx + 1}
            </span>
            <Avatar size="sm">
              {entry.member.user.avatar_url && (
                <AvatarImage src={entry.member.user.avatar_url} />
              )}
              <AvatarFallback>
                {getInitials(entry.member.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-medium">
              {entry.member.user.name}
            </span>
            <span className={`text-sm font-semibold tabular-nums ${idx === 0 ? "text-amber-600" : ""}`}>
              {entry.points} pts
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
