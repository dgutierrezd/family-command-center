import { getSharedLists } from "@/actions/lists";
import { ListCard } from "@/components/lists/list-card";
import { ListsPageClient } from "./lists-page-client";
import { ClipboardList } from "lucide-react";

export const metadata = {
  title: "Lists",
};

export default async function ListsPage() {
  const lists = await getSharedLists(true);
  const activeLists = lists.filter((l) => !l.archived);
  const archivedLists = lists.filter((l) => l.archived);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Lists</h1>
        <ListsPageClient />
      </div>

      {activeLists.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <ClipboardList className="size-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            No lists yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      {archivedLists.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Archived
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archivedLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
