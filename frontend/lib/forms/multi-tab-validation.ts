import type { FieldErrors, FieldValues } from "react-hook-form";
import { toast } from "sonner";

export interface TabFieldRule<T extends string> {
  prefix: string;
  tab: T;
}

export function collectErrorMessages(errors: FieldErrors<FieldValues>): string[] {
  const messages: string[] = [];

  function walk(node: FieldErrors<FieldValues>) {
    for (const value of Object.values(node)) {
      if (!value) continue;
      if (typeof value === "object" && "message" in value && typeof value.message === "string") {
        messages.push(value.message);
        continue;
      }
      if (typeof value === "object") {
        walk(value as FieldErrors<FieldValues>);
      }
    }
  }

  walk(errors);
  return messages;
}

export function findFirstErrorPath(errors: FieldErrors<FieldValues>): string | undefined {
  function walk(node: FieldErrors<FieldValues>, prefix = ""): string | undefined {
    for (const [key, value] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (!value) continue;
      if (typeof value === "object" && "message" in value && value.message) {
        return path;
      }
      if (typeof value === "object") {
        const nested = walk(value as FieldErrors<FieldValues>, path);
        if (nested) return nested;
      }
    }
    return undefined;
  }

  return walk(errors);
}

export function resolveTabForField<T extends string>(
  fieldPath: string,
  rules: TabFieldRule<T>[],
  fallback: T
): T {
  const sorted = [...rules].sort((a, b) => b.prefix.length - a.prefix.length);

  for (const rule of sorted) {
    if (fieldPath === rule.prefix || fieldPath.startsWith(`${rule.prefix}.`)) {
      return rule.tab;
    }
  }

  return fallback;
}

export function getTabsWithErrors<T extends string>(
  errors: FieldErrors<FieldValues>,
  rules: TabFieldRule<T>[],
  fallback: T
): Set<T> {
  const tabs = new Set<T>();
  const firstPath = findFirstErrorPath(errors);
  if (!firstPath) return tabs;

  function walk(node: FieldErrors<FieldValues>, prefix = "") {
    for (const [key, value] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (!value) continue;
      if (typeof value === "object" && "message" in value && value.message) {
        tabs.add(resolveTabForField(path, rules, fallback));
        continue;
      }
      if (typeof value === "object") {
        walk(value as FieldErrors<FieldValues>, path);
      }
    }
  }

  walk(errors);
  return tabs;
}

export function createOnInvalidHandler<T extends string>({
  rules,
  fallbackTab,
  setActiveTab,
  tabLabels,
}: {
  rules: TabFieldRule<T>[];
  fallbackTab: T;
  setActiveTab: (tab: T) => void;
  tabLabels: Record<T, string>;
}) {
  return (errors: FieldErrors<FieldValues>) => {
    const messages = collectErrorMessages(errors);
    const firstPath = findFirstErrorPath(errors);
    const tab = firstPath ? resolveTabForField(firstPath, rules, fallbackTab) : fallbackTab;

    setActiveTab(tab);

    const tabLabel = tabLabels[tab] ?? "form";
    const primaryMessage = messages[0];

    if (messages.length <= 1 && primaryMessage) {
      toast.error(`${primaryMessage} (check ${tabLabel} tab)`);
      return;
    }

    toast.error(
      `Please fix ${messages.length} validation errors. Open the ${tabLabel} tab to review required fields.`
    );
  };
}

export function showValidationToast(message: string, tab: string) {
  toast.error(`${message} (check ${tab} tab)`);
}
