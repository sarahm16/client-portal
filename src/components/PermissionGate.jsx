import { usePermissions } from "../auth/hooks/usePermissions";

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  return hasAccess ? children : fallback;
}
