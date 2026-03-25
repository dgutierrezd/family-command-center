"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { generateGroceryList } from "@/actions/meals";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";

interface GenerateListButtonProps {
  weekStart: string;
  weekEnd: string;
}

export function GenerateListButton({
  weekStart,
  weekEnd,
}: GenerateListButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await generateGroceryList(weekStart, weekEnd) as { success?: boolean; count?: number; error?: string };
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Grocery list generated with ${result.count ?? 0} items`);
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      <ShoppingCartIcon data-icon="inline-start" />
      {isPending ? "Generating..." : "Generate Grocery List"}
    </Button>
  );
}
