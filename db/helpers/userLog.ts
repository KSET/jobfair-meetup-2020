import {
  insertQuery,
} from "../query";
import type {
 User,
} from "../../api/services/user-service";

const table = "users_log";

export interface UserLogData {
  userUid: User["uid"];
  event: string;
  data: Record<string, unknown>;
}

export interface UserLog {
  id: number;
  userUid: User["uid"];
  event: string;
  data: Record<string, unknown>;
  timestamp: string | Date;
}

const insert = insertQuery<UserLogData>(table);

const allowedKeys: (keyof UserLogData)[] = [
  "userUid",
  "event",
  "data",
];

export const queryUserLogCreate =
  insert(
    {
      allowedKeys,
    },
  )
;
