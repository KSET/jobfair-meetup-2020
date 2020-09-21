import QRCode from "qrcode";
import {
  HttpStatus,
  internalRequest,
} from "../../helpers/http";
import {
  injectAuthData,
} from "../../helpers/middleware";
import {
  AuthRouter,
} from "../../helpers/route";

const qrResponse = (res, { uid, firstName, lastName }) => {
  res.set("cache-control", "no-store, private");
  res.set("expires", "Sat, 26 Jul 1997 05:00:00 GMT");
  res.set("pragma", "no-cache");
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

const addUserData = () => injectAuthData({
  fullUserData: true,
});

const router = new AuthRouter({});

router.getRaw("/for-user/qr.png", addUserData(), (req, res) => {
  const { uid, first_name, last_name } = req.authUser;

  if (!uid) {
    res.status(HttpStatus.Error.Client.NotFound);

    return res.end();
  }

  return qrResponse(res, {
    uid,
    // eslint-disable-next-line camelcase
    firstName: first_name,
    // eslint-disable-next-line camelcase
    lastName: last_name,
  });
});

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

  return qrResponse(res, data);
});

export default router;
