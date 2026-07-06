export type MenuLocation = "header" | "footer" | "mobile";

export interface Menu {
  id: string;
  name: string;
  slug: string;
  location: MenuLocation;
}

export interface MenuItem {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  url: string;
  target: "_self" | "_blank";
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuWithStats extends Menu {
  itemCount: number;
  activeCount: number;
}

export interface MenuItemNode extends MenuItem {
  children: MenuItemNode[];
}

export interface FlatMenuItem extends MenuItem {
  depth: number;
}

export type MenuItemInput = {
  label: string;
  url: string;
  target: "_self" | "_blank";
  icon: string | null;
  parentId: string | null;
  isActive: boolean;
};
