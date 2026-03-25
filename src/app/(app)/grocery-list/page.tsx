import { getGroceryItems } from "@/actions/grocery";
import { GroceryList } from "@/components/meals/grocery-list";

export default async function GroceryListPage() {
  const items = await getGroceryItems();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Grocery List</h1>
      <GroceryList items={items} />
    </div>
  );
}
