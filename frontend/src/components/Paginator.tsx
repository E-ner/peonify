import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Client-side pagination over a list. Resets to page 1 when the list changes size. */
export function usePagination<T>(items: T[] | null, pageSize: number) {
  const [page, setPage] = useState(1);
  const total = items?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [total]);

  const pageItems = useMemo(
    () => (items ? items.slice((page - 1) * pageSize, page * pageSize) : null),
    [items, page, pageSize]
  );

  return { page, setPage, pageCount, pageItems, total };
}

export default function Paginator({
  page,
  pageCount,
  onChange,
  total,
  label = "items",
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  total?: number;
  label?: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">
        Page {page} of {pageCount}
        {total !== undefined && ` · ${total} ${label}`}
      </span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="size-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
