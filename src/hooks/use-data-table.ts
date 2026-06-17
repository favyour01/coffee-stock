"use client";

import { useEffect, useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface UseDataTableOptions<T> {
  data: T[];
  searchQuery?: string;
  searchFilter?: (row: T, query: string) => boolean;
  sortColumn?: string | null;
  sortDirection?: SortDirection;
  sortValue?: (row: T, columnId: string) => string | number;
  page: number;
  pageSize: number;
}

export function useDataTable<T>({
  data,
  searchQuery = "",
  searchFilter,
  sortColumn = null,
  sortDirection = "asc",
  sortValue,
  page,
  pageSize,
}: UseDataTableOptions<T>) {
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    if (searchFilter) {
      return data.filter((row) => searchFilter(row, query));
    }

    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) => {
        if (value == null) return false;
        if (typeof value === "object") {
          return JSON.stringify(value).toLowerCase().includes(query);
        }
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchFilter]);

  const sorted = useMemo(() => {
    if (!sortColumn || !sortValue) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = sortValue(a, sortColumn);
      const bVal = sortValue(b, sortColumn);

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal), "id", {
        numeric: true,
        sensitivity: "base",
      });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortColumn, sortDirection, sortValue]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  return {
    rows,
    totalCount,
    totalPages,
    safePage,
  };
}

export function useDataTableState(defaultPageSize = 10) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const toggleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumn(columnId);
    setSortDirection("asc");
  };

  return {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortColumn,
    sortDirection,
    toggleSort,
  };
}
