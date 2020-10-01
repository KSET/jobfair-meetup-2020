import QRCode from "qrcode";
import {
  HttpStatus,
  internalRequest,
} from "../../helpers/http";
import {
  AuthRouter,
} from "../../helpers/route";

const qrResponse = (res, { uid, firstName, lastName }) => {
  res.set("content-type", "image/png");

  QRCode.toFileStream(
    res,
    JSON.stringify({
      // eslint-disable-next-line camelcase
      resume_uid: uid,
      // eslint-disable-next-line camelcase
      first_name: firstName,
      // eslint-disable-next-line camelcase
      last_name: lastName,
    }),
    {
      errorCorrectionLevel: "H",
      scale: 10,
    },
  );
};

const router = new AuthRouter({});

router.getRaw("/for-uid/:uid.png", async ({ params, authHeader }, res) => {
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
  res.set("Cache-Control", `public, max-age=${ cacheFor }, s-max-age=${ cacheFor }, immutable`);

  return qrResponse(res, data);
});

export default router;
