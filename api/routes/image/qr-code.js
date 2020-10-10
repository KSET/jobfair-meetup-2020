import * as Sentry from "@sentry/node";
import QRCode from "qrcode";
import {
  HttpStatus,
  internalRequest,
} from "../../helpers/http";
import {
  AuthRouter,
} from "../../helpers/route";

const router = new AuthRouter({});

router.getRaw("/for-uid/:uid.svg", async (req, res) => {
  const { params, authHeader } = req;
  const { uid } = params;

  const { data } = await internalRequest(
    "get",
    `/resumes/for-user/${ uid }`,
    {
      headers: {
        Authorization: authHeader,
      },
    },
  ) || {};

  if (!data) {
    res.status(HttpStatus.Error.Client.NotFound);

    return res.end();
  }

  const cacheFor = 7 * 24 * 60 * 60;

  const payload = JSON.stringify({
    // eslint-disable-next-line camelcase
    resume_uid: uid,
    // eslint-disable-next-line camelcase
    first_name: data.firstName,
    // eslint-disable-next-line camelcase
    last_name: data.lastName,
  });

  const options = {
    errorCorrectionLevel: "H",
    scale: 10,
    type: "svg",
  };

  try {
    const qrCode = await QRCode.toString(payload, options);

    res.set("Cache-Control", `public, max-age=${ cacheFor }, s-max-age=${ cacheFor }, immutable`);
    res.set("Content-Type", "image/svg+xml");
    res.write(qrCode);
  } catch (e) {
    Sentry.captureException(e, { req });
    res.status(HttpStatus.Error.Server.InternalServerError);
  }

  res.end();
});

export default router;
