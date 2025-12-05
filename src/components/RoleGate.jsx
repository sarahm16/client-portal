import { useRole } from "../auth/hooks/usePermissions";

export function RoleGate({ roles, fallback = null, children }) {
  const { role } = useRole();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  const hasAccess = allowedRoles.includes(role);

  return hasAccess ? children : fallback;
}
