export const roles = [
  "nobody",
  "student",
  "account_manager",
  "moderator",
  "admin",
];

export const hasPermission =
  (minimumRoleName, currentRoleName) =>
    roles.indexOf(minimumRoleName) <= roles.indexOf(currentRoleName);


export const isAdmin = (roleName) => hasPermission("admin", roleName);
export const isModerator = (roleName) => hasPermission("moderator", roleName);
