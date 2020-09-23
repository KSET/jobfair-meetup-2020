/**
 * @readonly
 * @enum {String}
 */
export const RoleNames = {
  BASE: "nobody",
  STUDENT: "student",
  ACCOUNT_MANAGER: "account_manager",
  MODERATOR: "moderator",
  ADMIN: "admin",
};

export const roles = Object.values(RoleNames);

const roleNameToIndex = Object.fromEntries(
  roles
    .map(
      (v, i) =>
        [ v, i ]
      ,
    )
  ,
);

export const hasPermission =
  (minimumRoleName, currentRoleName) =>
    roleNameToIndex[minimumRoleName] <= roleNameToIndex[currentRoleName];


export const isAdmin = (roleName) => hasPermission(RoleNames.ADMIN, roleName);
export const isModerator = (roleName) => hasPermission(RoleNames.MODERATOR, roleName);
export const isStudent = (roleName) => hasPermission(RoleNames.BASE, roleName);
