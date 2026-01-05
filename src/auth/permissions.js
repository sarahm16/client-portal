export const ROLES = {
  EMPLOYEE: "Employee",
  EXTERNAL_ADMIN: "External Admin",
  INTERNAL_ADMIN: "Internal Admin",
};

export const PERMISSIONS = {
  // Work Orders
  CANCEL_WORK_ORDERS: "cancel_work-orders",
  EDIT_WORK_ORDERS: "edit_work-orders",
  VIEW_WORK_ORDERS: "view_work-orders",

  // NTE Requests
  APPROVE_NTE: "approve_nte-requests",
  REJECT_NTE: "reject_nte-requests",

  // User Management
  CREATE_EMPLOYEE: "create_employee",
  MANAGE_EMPLOYEES: "manage_employees",
  CREATE_EXTERNAL_ADMIN: "create_external_admin",
  MANAGE_EXTERNAL_ADMINS: "manage_external_admins",
  CREATE_INTERNAL_ADMIN: "create_internal_admin",
  MANAGE_INTERNAL_ADMINS: "manage_internal_admins",

  // Site Management
  VIEW_SITES: "view_sites",
};

export const ROLE_PERMISSIONS = {
  [ROLES.EMPLOYEE]: [PERMISSIONS.VIEW_WORK_ORDERS, PERMISSIONS.VIEW_SITES],
  [ROLES.EXTERNAL_ADMIN]: [
    PERMISSIONS.CANCEL_WORK_ORDERS,
    PERMISSIONS.EDIT_WORK_ORDERS,
    PERMISSIONS.APPROVE_NTE,
    PERMISSIONS.REJECT_NTE,
    PERMISSIONS.CREATE_EMPLOYEE,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_WORK_ORDERS,
    PERMISSIONS.VIEW_SITES,
  ],
  [ROLES.INTERNAL_ADMIN]: [...Object.values(PERMISSIONS)],
};
