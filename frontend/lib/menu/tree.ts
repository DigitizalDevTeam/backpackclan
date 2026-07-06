import type { FlatMenuItem, MenuItem, MenuItemNode } from "@/types/menu";

export function buildMenuTree(items: MenuItem[]): MenuItemNode[] {
  const map = new Map<string, MenuItemNode>();
  const roots: MenuItemNode[] = [];

  items.forEach((item) => map.set(item.id, { ...item, children: [] }));

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: MenuItemNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

export function flattenMenuTree(
  nodes: MenuItemNode[],
  depth = 0
): FlatMenuItem[] {
  const result: FlatMenuItem[] = [];
  for (const node of nodes) {
    const { children, ...item } = node;
    result.push({ ...item, depth });
    result.push(...flattenMenuTree(children, depth + 1));
  }
  return result;
}
