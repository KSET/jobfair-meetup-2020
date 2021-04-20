import flow from "lodash/fp/flow";
import values from "lodash/fp/values";
import fromPairs from "lodash/fp/fromPairs";
import map from "lodash/fp/map";

const mapWithIndex = map.convert({ cap: false });

// This is just a noop function to force the TS compiler to typecheck the enum
const ensureEnumKeysSameAsValues = <T>(_kv: { [K in keyof T]: K }) => null;

export enum Role {
  base = "base",
  company = "company",
  student = "student",
  moderator = "moderator",
  admin = "admin",
}

ensureEnumKeysSameAsValues(Role);

const roleNameToPriority: Record<Role, number> =
  flow(
    values,
    mapWithIndex((value: Role, i: number) => [ value, i ]),
    fromPairs,
  )(Role)
;

export const hasPermission =
  (
    minimumRoleName: Role,
    currentRoleName: Role,
  ): boolean =>
    roleNameToPriority[minimumRoleName] <= roleNameToPriority[currentRoleName]
;

const isAtLeast =
  (role: Role) =>
    (roleName: Role) =>
      hasPermission(role, roleName)
;

export const isAdmin = isAtLeast(Role.admin);
export const isModerator = isAtLeast(Role.moderator);
export const isStudent = isAtLeast(Role.student);
