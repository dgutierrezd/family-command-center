import { getGroceryItems } from "@/actions/grocery";
import { GroceryList } from "@/components/meals/grocery-list";

export default async function GroceryListPage() {
  const items = await getGroceryItems();

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">Grocery List</h1>
      <GroceryList items={items} />
    </div>
  );
}
