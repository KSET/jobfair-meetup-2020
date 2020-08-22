import {
 HttpStatus,
} from "./http";
import {
  extractAuthorizationToken,
  fetchAuthenticatedUser,
} from "./token";
import {
  hasPermission,
  RoleNames,
} from "./permissions";
import {
  error,
} from "./route";

/**
 * @typedef {Object} AuthData
 * @property {boolean} [fullUserData] - Whether to fetch user data from remote or just validate token (default: false)
 */

/**
 * @typedef {AuthData} AuthConfig
 * @property {string} [role] - Which is the minimum role required to view the route (default: nobody)
 */

export const injectAuthData =
  ({
     fullUserData = false,
   } = {}) =>
    async (req, _res, next = () => null) => {
      const authHeader = extractAuthorizationToken(req);

      if (authHeader) {
        req.authHeader = authHeader;
        req.authUser = await fetchAuthenticatedUser(authHeader, fullUserData);
      } else {
        req.authHeader = null;
        req.authUser = null;
      }

      return next();
    }
;

/**
 * @param {AuthRouter}
 * @return {function(...[*]=)}
 */
export const requireAuth =
  ({
     fullUserData = false,
     role = RoleNames.BASE,
   } = {}) =>
    async (req, res, next) => {
      await injectAuthData({ fullUserData })(req);

      if (!req.authUser) {
        res.status(HttpStatus.Error.Unauthorized);

        return res.json(error({
          reason: "authorization-required",
          status: HttpStatus.Error.Unauthorized,
        }));
      }

      if (false === hasPermission(role, req.authUser.role)) {
        res.status(HttpStatus.Error.Unauthorized);

        return res.json(error({
          reason: "authorization-required",
          status: HttpStatus.Error.Unauthorized,
        }));
      }

      return next();
    }
;
