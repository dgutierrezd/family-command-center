import { getSharedList } from "@/actions/lists";
import { ListItemRow } from "@/components/lists/list-item-row";
import { ListDetailClient } from "./list-detail-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "List",
};

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getSharedList(id);

  if (!list) notFound();

  const checkedCount = list.items?.filter((i) => i.checked).length ?? 0;
  const totalCount = list.items?.length ?? 0;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/lists"
          className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight truncate">
            {list.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {checkedCount}/{totalCount} completed
          </p>
        </div>
        <ListDetailClient listId={list.id} archived={list.archived} />
      </div>

      <ListAddItemForm listId={list.id} />

      <div className="divide-y divide-border">
        {list.items && list.items.length > 0 ? (
          list.items.map((item) => <ListItemRow key={item.id} item={item} />)
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No items yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
}

function ListAddItemForm({ listId }: { listId: string }) {
  return <AddItemFormClient listId={listId} />;
}

import { AddItemFormClient } from "./add-item-form-client";
