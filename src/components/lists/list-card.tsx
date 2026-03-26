"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList, Archive } from "lucide-react";
import type { SharedList } from "@/types";

interface ListCardProps {
  list: SharedList;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <Link href={`/lists/${list.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="size-4 text-violet-500" />
            {list.name}
            {list.archived && (
              <Archive className="size-3 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {list._count?.items ?? 0} item{(list._count?.items ?? 0) !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
