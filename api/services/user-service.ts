import _ from "lodash/fp";
import {
  customAlphabet,
} from "nanoid/async";
import bcrypt from "bcryptjs";
import {
  queryUserBy,
  queryUserCreate,
  User as DbUser,
  UserData,
} from "../../db/helpers/user";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  Role,
} from "../helpers/permissions";
import {
  ServiceError,
} from "./error-service";
import ResumeService from "./resume-service";
import type {
  Resume,
} from "./resume-service";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  resume: Resume | null;
}

const USER_KEYS: (keyof User)[] = [
  "uid",
  "name",
  "email",
  "phone",
  "role",
  "resume",
];

export interface FullUser extends User {
  id: number;
  password: string;
  createdAt: string;
  updatedAt: string;
}

const HASH_ROUNDS = 13;

const hash =
  (password: UserData["password"]): Promise<string> =>
    new Promise(
      (resolve) =>
        bcrypt.hash(
          password,
          HASH_ROUNDS,
          (_err, hash) =>
            resolve(hash)
          ,
        ),
    )
;

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  31,
);

const format: (user: DbUser | FullUser) => User =
  _.flow(
    keysFromSnakeToCamelCase,
    _.pick(USER_KEYS),
  )
;

export class UserServiceError extends ServiceError {
}

export default class UserService {
  static async infoBy(key: keyof DbUser, value: unknown): Promise<User | null> {
    const fullUser = await this.fullInfoBy(key, value);

    if (!fullUser) {
      return null;
    }

    return this.Format(fullUser);
  }

  static async fullInfoBy(key: keyof DbUser, value: unknown): Promise<FullUser | null> {
    const dbUser = await Client.queryOneOnce<DbUser>(queryUserBy({
      [key]: value,
    }));

    if (!dbUser) {
      return null;
    }

    const resume = await ResumeService.info(dbUser.uid);

    return this.FormatFull(dbUser, resume);
  }

  static async create(
    {
      email,
      name,
      password,
      phone,
      role = Role.student,
    }: UserData,
  ): Promise<User> {
    const data: UserData = {
      email,
      name,
      password: await hash(password),
      phone,
      role,
    };

    const maxTries = 10;
    let tries = 0;
    let user: DbUser | null = null;
    do {
      try {
        data.uid = await nanoid();

        user = await Client.queryOneOnce<DbUser>(queryUserCreate(data as unknown as Record<string, unknown>));
      } catch (e) {
        if ("users_uid_uindex" === e?.constraint) {
          continue;
        }

        throw e;
      }
    } while (
      null === user &&
      tries++ > maxTries
      );

    if (!user) {
      throw new UserServiceError(
        "Nešto je pošlo po krivu. Molimo probajte ponovno.",
      );
    }

    return this.Format(user);
  }

  static FormatFull(user: DbUser | FullUser, resume: Resume | null = null): FullUser {
    const data = keysFromSnakeToCamelCase({
      resume,
      ...user,
    });

    return {
      ...data,
    };
  }

  static Format(user: DbUser | FullUser, resume: Resume | null = null): User {
    return {
      resume,
      ...format(user),
    };
  }
}
