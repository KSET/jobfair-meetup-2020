import * as Sentry from "@sentry/node";
import bcrypt from "bcryptjs";
import type {
  UserData,
} from "../../db/helpers/user";
import {
  encodeRedirectParam,
} from "../../helpers/url";
import EmailService from "./email-service";
import {
  ServiceError,
} from "./error-service";
import UserService from "./user-service";
import type {
  User,
} from "./user-service";

const compare =
  (
    password: string,
    hash: UserData["password"],
  ): Promise<boolean> =>
    bcrypt.compare(password, hash)
;

export class AuthServiceError extends ServiceError {
}

export default class AuthService {
  static async register(data: UserData): Promise<User> {
    const user = await UserService.create(data);

    try {
      await EmailService.sendTemplate(
        user.email,
        "Registracija na Job Fair Meetup",
        "email/register.ejs",
        {
          user,
          links: {
            resume: `${ process.env.BASE_URL }/r?q=${ encodeURIComponent(encodeRedirectParam({
              name: "PageStudentResumeHome",
              params: {},
            })) }`,
          },
        },
      );
    } catch (e) {
      Sentry.captureException(e);
    }

    return user;
  }

  static async login(email: UserData["email"], password: UserData["password"]): Promise<User | null> {
    const user = await UserService.fullInfoBy("email", email);

    const passwordValid = await compare(password, user?.password || "");

    if (!user || !passwordValid) {
      return null;
    }

    return UserService.Format(user);
  }
}
