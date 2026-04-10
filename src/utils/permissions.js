export function isAdmin(user) {
  return user?.role === "admin";
}

export function hasPermission(user, permissionKey) {
  if (!user) return false;
  if (user.role === "admin") return true;

  return Boolean(user.permissions?.[permissionKey]);
}
// * ====
// * import { hasPermission } from "@/utils/permissions";
// * hide Add Project in header/menu
// * 
// * change it to:
// * {hasPermission(user, "canAddProject") && (
//      <Link href="/projects/add">Add Project</Link>
//   )}
