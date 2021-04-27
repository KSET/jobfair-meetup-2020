import jwt from "jsonwebtoken";
import {
  HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  Router,
} from "../../helpers/route";
import {
  getJwtSecret,
} from "../../helpers/token";
import AuthService from "../../services/auth-service";
import UserLogService from "../../services/user-log-service";

const router = new Router();

router.post("/", async ({ body, ip, ips }, res) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new ApiError("no-credentials-provided");
  }

  const user = await AuthService.login(email, password);

  if (!user) {
    throw new ApiError(
      "invalid-credentials",
      HttpStatus.Error.Client.Unauthorized,
      null,
    );
  }

  const { uid } = user;

  const payload = {
    uid,
  };

  const token = jwt.sign(
    payload,
    getJwtSecret(),
    {
      expiresIn: "2 weeks",
    },
  );

  res.cookie(
    process.env.JOBFAIR_COOKIE_NAME,
    JSON.stringify({
      token,
    }),
    {
      domain: `.${ new URL(process.env.BASE_URL || "").hostname }`,
      expires: "",
      secure: "development" !== process.env.NODE_ENV,
      sameSite: "strict",
    },
  );

  await UserLogService.log(
    user.uid,
    "login",
    {
      ip,
      ips,
    },
  );

  return user;
});

export default router;
