export type Role =
  | "admin"
  | "manager"
  | "accountant"
  | "inventory_manager"
  | "viewer";

export const roles: Role[] = [
  "admin",
  "manager",
  "accountant",
  "inventory_manager",
  "viewer",
];

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

export const permissions: Record<string, Permission> = {
  // Cash Flow Permissions
  "cash-flow.view": {
    id: "cash-flow.view",
    name: "View Cash Flow",
    description: "Can view cash flow data and reports",
  },
  "cash-flow.manage": {
    id: "cash-flow.manage",
    name: "Manage Cash Flow",
    description: "Can manage cash flow entries and transactions",
  },
  "cash-flow.forecast": {
    id: "cash-flow.forecast",
    name: "Access Cash Flow Forecasts",
    description: "Can access AI-powered cash flow forecasts",
  },

  // Inventory Permissions
  "inventory.view": {
    id: "inventory.view",
    name: "View Inventory",
    description: "Can view inventory data and reports",
  },
  "inventory.manage": {
    id: "inventory.manage",
    name: "Manage Inventory",
    description: "Can manage inventory items and stock levels",
  },
  "inventory.orders": {
    id: "inventory.orders",
    name: "Manage Orders",
    description: "Can process and manage orders",
  },

  // User Management Permissions
  "users.view": {
    id: "users.view",
    name: "View Users",
    description: "Can view user information",
  },
  "users.manage": {
    id: "users.manage",
    name: "Manage Users",
    description: "Can create, edit, and delete users",
  },

  // Reports Permissions
  "reports.view": {
    id: "reports.view",
    name: "View Reports",
    description: "Can view financial and inventory reports",
  },
  "reports.generate": {
    id: "reports.generate",
    name: "Generate Reports",
    description: "Can generate and export reports",
  },
};

export const rolePermissions: RolePermissions[] = [
  {
    role: "admin",
    permissions: Object.values(permissions),
  },
  {
    role: "manager",
    permissions: [
      permissions["cash-flow.view"],
      permissions["cash-flow.manage"],
      permissions["cash-flow.forecast"],
      permissions["inventory.view"],
      permissions["inventory.manage"],
      permissions["inventory.orders"],
      permissions["reports.view"],
      permissions["reports.generate"],
    ],
  },
  {
    role: "accountant",
    permissions: [
      permissions["cash-flow.view"],
      permissions["cash-flow.manage"],
      permissions["cash-flow.forecast"],
      permissions["reports.view"],
      permissions["reports.generate"],
    ],
  },
  {
    role: "inventory_manager",
    permissions: [
      permissions["inventory.view"],
      permissions["inventory.manage"],
      permissions["inventory.orders"],
      permissions["reports.view"],
    ],
  },
  {
    role: "viewer",
    permissions: [
      permissions["cash-flow.view"],
      permissions["inventory.view"],
      permissions["reports.view"],
    ],
  },
];

export const hasPermission = (
  userRole: Role,
  permissionId: string
): boolean => {
  const roleConfig = rolePermissions.find((rp) => rp.role === userRole);
  if (!roleConfig) return false;
  return roleConfig.permissions.some((p) => p.id === permissionId);
};
