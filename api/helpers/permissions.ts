import flow from "lodash/fp/flow";
import values from "lodash/fp/values";
import fromPairs from "lodash/fp/fromPairs";
import map from "lodash/fp/map";

const mapWithIndex = map.convert({ cap: false });

export enum RoleNames {
  BASE = "nobody",
  STUDENT = "student",
  ACCOUNT_MANAGER = "account_manager",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

const roleNameToPriority: Record<RoleNames, number> =
  flow(
    values,
    mapWithIndex((value: RoleNames, i: number) => [ value, i ]),
    fromPairs,
  )(RoleNames)
;

export const hasPermission =
  (
    minimumRoleName: RoleNames,
    currentRoleName: RoleNames,
  ): boolean =>
    roleNameToPriority[minimumRoleName] <= roleNameToPriority[currentRoleName]
;

const isAtLeast =
  (role: RoleNames) =>
    (roleName: RoleNames) =>
      hasPermission(role, roleName)
;

export const isAdmin = isAtLeast(RoleNames.ADMIN);
export const isModerator = isAtLeast(RoleNames.MODERATOR);
export const isStudent = isAtLeast(RoleNames.BASE);
