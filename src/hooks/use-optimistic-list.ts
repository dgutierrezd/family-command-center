"use client";

import { useOptimistic, useCallback } from "react";

type Action<T> =
  | { type: "add"; item: T }
  | { type: "update"; item: T }
  | { type: "remove"; id: string };

export function useOptimisticList<T extends { id: string }>(items: T[]) {
  const [optimisticItems, dispatch] = useOptimistic(
    items,
    (state: T[], action: Action<T>) => {
      switch (action.type) {
        case "add":
          return [...state, action.item];
        case "update":
          return state.map((i) =>
            i.id === action.item.id ? action.item : i
          );
        case "remove":
          return state.filter((i) => i.id !== action.id);
        default:
          return state;
      }
    }
  );

  const addOptimistic = useCallback(
    (item: T) => dispatch({ type: "add", item }),
    [dispatch]
  );

  const updateOptimistic = useCallback(
    (item: T) => dispatch({ type: "update", item }),
    [dispatch]
  );

  const removeOptimistic = useCallback(
    (id: string) => dispatch({ type: "remove", id }),
    [dispatch]
  );

  return { optimisticItems, addOptimistic, updateOptimistic, removeOptimistic };
}
