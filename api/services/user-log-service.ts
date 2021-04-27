import _ from "lodash/fp";
import {
  queryUserLogCreate,
} from "../../db/helpers/userLog";
import type {
  UserLogData,
  UserLog as DbUserLog,
} from "../../db/helpers/userLog";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";

export interface UserLog {
  event: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

const userLog: UserLog = {
  event: "",
  data: {},
  timestamp: new Date(),
};

const userLogKeys: (keyof UserLog)[] = Object.keys(userLog) as (keyof UserLog)[];

const format: (log: DbUserLog) => UserLog =
  _.flow(
    keysFromSnakeToCamelCase,
    _.pick(userLogKeys),
  )
;

export default class UserLogService {
  static async log(userUid: UserLogData["userUid"], event: UserLogData["event"], data: UserLogData["data"]): Promise<UserLog> {
    const log = await Client.queryOneOnce<DbUserLog>(queryUserLogCreate({
      userUid,
      event,
      data,
    })) as DbUserLog;

    return format(log);
  }
}
