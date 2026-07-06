import type {
  FlatMenuItem,
  Menu,
  MenuItem,
  MenuItemInput,
  MenuItemNode,
  MenuWithStats,
} from "@/types/menu";
import { buildMenuTree, flattenMenuTree } from "@/lib/menu/tree";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";

const MENUS: Menu[] = [
  { id: "1", name: "Header Menu", slug: "header", location: "header" },
  { id: "2", name: "Footer Menu", slug: "footer", location: "footer" },
  { id: "3", name: "Mobile Menu", slug: "mobile", location: "mobile" },
];

function seedItems(): MenuItem[] {
  return [
    { id: "h1", menuId: "1", parentId: null, label: "Home", url: "/", target: "_self", icon: "Home", sortOrder: 0, isActive: true },
    { id: "h2", menuId: "1", parentId: null, label: "Destinations", url: "/destinations", target: "_self", icon: "MapPin", sortOrder: 1, isActive: true },
    { id: "h2a", menuId: "1", parentId: "h2", label: "Leh Ladakh", url: "/destinations/leh-ladakh", target: "_self", icon: null, sortOrder: 0, isActive: true },
    { id: "h2b", menuId: "1", parentId: "h2", label: "Spiti Valley", url: "/destinations/spiti", target: "_self", icon: null, sortOrder: 1, isActive: true },
    { id: "h2c", menuId: "1", parentId: "h2", label: "Kashmir", url: "/destinations/kashmir", target: "_self", icon: null, sortOrder: 2, isActive: true },
    { id: "h2d", menuId: "1", parentId: "h2", label: "Bhutan", url: "/destinations/bhutan", target: "_self", icon: null, sortOrder: 3, isActive: true },
    { id: "h2e", menuId: "1", parentId: "h2", label: "Nepal", url: "/destinations/nepal", target: "_self", icon: null, sortOrder: 4, isActive: true },
    { id: "h3", menuId: "1", parentId: null, label: "Trips", url: "/trips", target: "_self", icon: "Compass", sortOrder: 2, isActive: true },
    { id: "h4", menuId: "1", parentId: null, label: "Blog", url: "/blog", target: "_self", icon: "BookOpen", sortOrder: 3, isActive: true },
    { id: "h5", menuId: "1", parentId: null, label: "About", url: "/about", target: "_self", icon: "Info", sortOrder: 4, isActive: true },
    { id: "h6", menuId: "1", parentId: null, label: "Contact", url: "/contact", target: "_self", icon: "Phone", sortOrder: 5, isActive: true },

    { id: "f1", menuId: "2", parentId: null, label: "About Us", url: "/about", target: "_self", icon: null, sortOrder: 0, isActive: true },
    { id: "f2", menuId: "2", parentId: null, label: "All Trips", url: "/trips", target: "_self", icon: null, sortOrder: 1, isActive: true },
    { id: "f3", menuId: "2", parentId: null, label: "Blog", url: "/blog", target: "_self", icon: null, sortOrder: 2, isActive: true },
    { id: "f4", menuId: "2", parentId: null, label: "Contact", url: "/contact", target: "_self", icon: null, sortOrder: 3, isActive: true },
    { id: "f5", menuId: "2", parentId: null, label: "Privacy Policy", url: "/privacy", target: "_self", icon: null, sortOrder: 4, isActive: true },
    { id: "f6", menuId: "2", parentId: null, label: "Terms & Conditions", url: "/terms", target: "_self", icon: null, sortOrder: 5, isActive: true },

    { id: "m1", menuId: "3", parentId: null, label: "Home", url: "/", target: "_self", icon: "Home", sortOrder: 0, isActive: true },
    { id: "m2", menuId: "3", parentId: null, label: "Destinations", url: "/destinations", target: "_self", icon: "MapPin", sortOrder: 1, isActive: true },
    { id: "m3", menuId: "3", parentId: null, label: "Trips", url: "/trips", target: "_self", icon: "Compass", sortOrder: 2, isActive: true },
    { id: "m4", menuId: "3", parentId: null, label: "Contact", url: "/contact", target: "_self", icon: "Phone", sortOrder: 3, isActive: true },
  ];
}

const menuItemStore = createPersistedStore("menu-items", seedItems());

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getMenuItemsState(): MenuItem[] {
  return menuItemStore.get();
}

function setMenuItemsState(items: MenuItem[]): void {
  menuItemStore.set(items);
}

export function getAllMenus(): MenuWithStats[] {
  const menuItems = getMenuItemsState();
  return MENUS.map((menu) => {
    const items = menuItems.filter((i) => i.menuId === menu.id);
    return {
      ...menu,
      itemCount: items.length,
      activeCount: items.filter((i) => i.isActive).length,
    };
  });
}

export function getMenuById(id: string): Menu | null {
  return MENUS.find((m) => m.id === id) ?? null;
}

export function getMenuItems(menuId: string): MenuItem[] {
  return getMenuItemsState()
    .filter((i) => i.menuId === menuId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export { buildMenuTree, flattenMenuTree };

export function getMenuItemById(itemId: string): MenuItem | null {
  return getMenuItemsState().find((i) => i.id === itemId) ?? null;
}

export function getDescendantIds(itemId: string, menuId: string): string[] {
  const menuItems = getMenuItemsState();
  const children = menuItems.filter(
    (i) => i.menuId === menuId && i.parentId === itemId
  );
  return children.flatMap((c) => [c.id, ...getDescendantIds(c.id, menuId)]);
}

export function createMenuItem(menuId: string, data: MenuItemInput): MenuItem {
  const menuItems = getMenuItemsState();
  const siblings = menuItems.filter(
    (i) => i.menuId === menuId && i.parentId === data.parentId
  );
  const item: MenuItem = {
    id: generateId(),
    menuId,
    ...data,
    sortOrder: siblings.length,
  };
  setMenuItemsState([...menuItems, item]);
  logActivity(`Menu item "${item.label}" added`, "menus");
  return item;
}

export function updateMenuItem(
  itemId: string,
  data: Partial<MenuItemInput>
): MenuItem {
  const menuItems = getMenuItemsState();
  const index = menuItems.findIndex((i) => i.id === itemId);
  if (index === -1) throw new Error("Menu item not found");

  const current = menuItems[index];
  const updated: MenuItem = { ...current, ...data };
  setMenuItemsState([
    ...menuItems.slice(0, index),
    updated,
    ...menuItems.slice(index + 1),
  ]);
  logActivity(`Menu item "${updated.label}" updated`, "menus");
  return updated;
}

export function deleteMenuItem(itemId: string): void {
  const menuItems = getMenuItemsState();
  const item = menuItems.find((i) => i.id === itemId);
  if (!item) throw new Error("Menu item not found");

  const toDelete = [itemId, ...getDescendantIds(itemId, item.menuId)];
  setMenuItemsState(menuItems.filter((i) => !toDelete.includes(i.id)));
  logActivity(`Menu item "${item.label}" deleted`, "menus");
}

export function reorderSiblings(
  menuId: string,
  parentId: string | null,
  orderedIds: string[]
): MenuItem[] {
  const menuItems = getMenuItemsState();
  const next = [...menuItems];
  orderedIds.forEach((id, index) => {
    const idx = next.findIndex(
      (i) => i.id === id && i.menuId === menuId
    );
    if (idx !== -1) {
      next[idx] = {
        ...next[idx],
        sortOrder: index,
        parentId,
      };
    }
  });
  setMenuItemsState(next);
  logActivity("Menu items reordered", "menus");
  return getMenuItems(menuId);
}

export function reorderMenuItems(
  menuId: string,
  orderedIds: string[]
): MenuItem[] {
  return reorderSiblings(menuId, null, orderedIds);
}

export function toggleMenuItemActive(itemId: string): MenuItem {
  const item = getMenuItemsState().find((i) => i.id === itemId);
  if (!item) throw new Error("Menu item not found");
  return updateMenuItem(itemId, { isActive: !item.isActive });
}
