import { ROLE_PERMISSIONS } from "../permissions";
import { useAuth } from "./AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    console.log(
      "Checking permission:",
      permission,
      "for user role:",
      user?.role,
    );
    if (!user?.role) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    console.log("User permissions:", userPermissions);
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    console.log(
      "Checking any permissions:",
      permissions,
      "for user role:",
      user?.role,
    );
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    console.log(
      "Checking all permissions:",
      permissions,
      "for user role:",
      user?.role,
    );
    return permissions.every((permission) => hasPermission(permission));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
}

export function useRole() {
  const { user } = useAuth();

  const isEmployee = () => user?.role === "Employee";
  const isManager = () => user?.role === "Manager";
  const isAdmin = () => user?.role === "Admin";

  return { isEmployee, isManager, isAdmin };
}
