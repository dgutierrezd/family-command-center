"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { GroceryItem } from "@/types";
import {
  addGroceryItem,
  toggleGroceryItem,
  clearCheckedItems,
} from "@/actions/grocery";
import { useFamily } from "@/hooks/use-family";
import { useRealtime } from "@/hooks/use-realtime";
import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon, ShoppingCart } from "lucide-react";

type ActionResult = { success?: boolean; error?: string };

interface GroceryListProps {
  items: GroceryItem[];
}

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Seafood",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Condiments",
  "Other",
];

export function GroceryList({ items }: GroceryListProps) {
  const { family } = useFamily();
  const { optimisticItems, updateOptimistic } = useOptimisticList(items);
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategory, setNewCategory] = useState("Other");

  useRealtime({ table: "grocery_items", familyId: family.id });

  function handleToggle(item: GroceryItem) {
    const newChecked = !item.checked;
    updateOptimistic({ ...item, checked: newChecked });

    startTransition(async () => {
      const result = await toggleGroceryItem(item.id, newChecked) as ActionResult;
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const formData = new FormData();
    formData.set("name", newName.trim());
    formData.set("quantity", newQuantity.trim());
    formData.set("category", newCategory);

    startTransition(async () => {
      const result = await addGroceryItem(formData) as ActionResult;
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNewName("");
      setNewQuantity("");
      setNewCategory("Other");
      toast.success("Item added");
    });
  }

  function handleClearChecked() {
    startTransition(async () => {
      const result = await clearCheckedItems() as ActionResult;
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Checked items cleared");
    });
  }

  // Group items by category
  const grouped = optimisticItems.reduce<Record<string, GroceryItem[]>>(
    (acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.keys(grouped).sort();
  const hasChecked = optimisticItems.some((i) => i.checked);

  return (
    <div className="space-y-6">
      {/* Add item form */}
      <Card className="p-4">
        <form onSubmit={handleAdd} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              placeholder="Item name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="w-24">
            <Input
              placeholder="Qty"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />
          </div>
          <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="icon" disabled={isPending}>
            <PlusIcon />
          </Button>
        </form>
      </Card>

      {/* Clear checked */}
      {hasChecked && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChecked}
            disabled={isPending}
          >
            <TrashIcon data-icon="inline-start" />
            Clear checked
          </Button>
        </div>
      )}

      {/* Grouped items */}
      {sortedCategories.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <ShoppingCart className="size-12 text-muted-foreground/20" />
          <p className="text-center text-muted-foreground">Your grocery list is empty.</p>
          <p className="text-center text-sm text-muted-foreground/70">Add items above or generate from your meal plan.</p>
        </div>
      )}

      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {category}
          </h3>
          <div className="space-y-1">
            {grouped[category].map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => handleToggle(item)}
                />
                <span
                  className={`flex-1 text-sm transition-all duration-200 ${
                    item.checked
                      ? "line-through text-muted-foreground/60 opacity-60"
                      : ""
                  }`}
                >
                  {item.name}
                </span>
                {item.quantity && (
                  <span className="text-xs text-muted-foreground">
                    {item.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
