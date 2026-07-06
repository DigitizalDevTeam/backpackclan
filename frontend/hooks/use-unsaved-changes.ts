"use client";

import { useEffect } from "react";

const DEFAULT_MESSAGE =
  "You have unsaved changes. Are you sure you want to leave?";

export function useUnsavedChanges(
  isDirty: boolean,
  message: string = DEFAULT_MESSAGE
) {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, message]);
}
