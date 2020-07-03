export const roleNames = {
  BASE: "nobody",
  STUDENT: "student",
  ACCOUNT_MANAGER: "account_manager",
  MODERATOR: "moderator",
  ADMIN: "admin",
};

export const roles = Object.values(roleNames);

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


export const isAdmin = (roleName) => hasPermission(roleNames.ADMIN, roleName);
export const isModerator = (roleName) => hasPermission(roleNames.MODERATOR, roleName);
