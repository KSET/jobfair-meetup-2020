/* eslint-disable camelcase */
import type {
 Role,
} from "../../api/helpers/permissions";
import {
  generateSelectQuery,
  insertQuery,
  updateQuery,
} from "../query";

const table = "users";

const insert = insertQuery(table);
const update = updateQuery(table);

export interface UserData {
  uid?: string;
  email: string;
  name: string;
  password: string;
  phone: string;
  role: string;
}

export interface User {
  id: number;
  uid: string;
  email: string;
  name: string;
  password: string;
  phone: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

const allowedKeysUpdate: (keyof UserData)[] = [
  "email",
  "name",
  "password",
  "phone",
  "role",
];

const allowedKeysCreate: (keyof UserData)[] = [
  "uid",
  ...allowedKeysUpdate,
];

export const queryUserCreate =
  insert(
    {
      allowedKeys: allowedKeysCreate,
    },
  )
;

export const queryUserUpdate =
  update(
    {
      allowedKeys: allowedKeysUpdate,
      allowedWhereKeys: [
        "id",
      ],
    },
  )
;

export const queryUserBy =
  (
    where: Partial<User>,
  ) =>
    generateSelectQuery({
      table,
      where: {
        ...where,
      },
    })
;
