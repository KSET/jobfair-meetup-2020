import {
  readdirSync,
} from "fs";
import {
  join as joinPath,
} from "path";
import express from "express";
import * as Sentry from "@sentry/node";
import MobileNotificationService from "../services/mobile-notification-service";
import {
  HttpStatus,
} from "./http";
import {
  requireAuth,
} from "./middleware";

/**
 * @typedef {Object} SuccessResponse
 * @property {boolean} error - Whether an error occurred
 * @property {StatusCode} status - The response status code (200 - OK, everything else - error)
 * @property {*} data - Any response data
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} error - Whether an error occurred
 * @property {StatusCode} status - The response status code (200 - OK, everything else - error)
 * @property {string} reason - The reason for the error (eg. error text)
 * @property {*} errorData - Any response data
 */

/**
 * @param {boolean} error - Whether the response is an error
 * @param {StatusCode} status - The status for the operation (200 for success)
 * @param {*} data - The data for the response
 */
export const response =
  ({
     error,
     status,
     data,
   }) =>
    ({
      error,
      data,
      status,
      ts: Date.now(),
    })
;

/**
 * @param {*} data
 * @returns {SuccessResponse}
 */
export const success =
  (data) =>
    response({
      error: false,
      status: HttpStatus.Success.Ok,
      data,
    })
;

/**
 * @param {number} status
 * @param {string} reason
 * @param {*} data
 * @returns {ErrorResponse}
 */
export const error =
  ({ reason, status = HttpStatus.Error.Client.Forbidden, data = null }) =>
    ({
      ...response({
        error: true,
        status,
        data: null,
      }),
      statusInfo: HttpStatus.codeToInfo(status),
      reason,
      errorData: data,
    })
;

export class ApiError extends Error {
  statusCode = HttpStatus.Error.Client.ImATeapot;

  data = null;

  constructor(message, statusCode = HttpStatus.Error.Client.ImATeapot, data = null) {
    super(message);
    this.statusCode = statusCode || HttpStatus.Error.Client.ImATeapot;
    this.data = data;
  }
}

export class ApiNotFoundError extends ApiError {
  constructor(message = "not-found", data = null) {
    super(message, HttpStatus.Error.Client.NotFound, data);
  }
}


export const asyncWrapper = (fn) => (...args) => {
  return (
    Promise
      .resolve(fn(...args))
      .catch(args.pop())
  );
};

export const rawRoute = (fn) => asyncWrapper(async (req, res, next) => {
  try {
    const result = await fn(req, res, next);

    if (result instanceof Buffer || "string" === typeof result) {
      return res.end(result);
    } else {
      return res.end();
    }
  } catch (e) {
    if (e.statusCode) {
      res.status(e.statusCode);
    } else {
      res.status(HttpStatus.Error.Client.Forbidden);
    }

    if (e instanceof ApiError) {
      res.set("X-Api-Error", e.message);
    } else {
      Sentry.captureException(e);

      if ("development" === process.env.NODE_ENV) {
        console.log("|> ERROR", "\n", e);
      } else {
        try {
          await MobileNotificationService.notify({
            title: "[Meetup] Exception",
            message: e.message,
            priority: 10,
          });
        } catch {
        }
      }
    }

    return res.end();
  }
});


export const apiRoute = (fn) => asyncWrapper(async (req, res, next) => {
  try {
    const result = await fn(req, res, next);

    return res.json(success(result));
  } catch (e) {
    if (e.statusCode) {
      res.status(e.statusCode);
    } else {
      res.status(HttpStatus.Error.Client.Forbidden);
    }

    const status = res.statusCode;

    const errorData = error({
      status,
      reason: e.message,
      data: e.data,
    });

    if (!(e instanceof ApiError)) {
      Sentry.captureException(e);

      if ("development" === process.env.NODE_ENV) {
        console.log(e);
        errorData._errorObject = e;
      } else {
        try {
          await MobileNotificationService.notify({
            title: "[Meetup] Exception",
            message: e.message,
            priority: 10,
          });
        } catch {
        }
      }
    }

    return res.json(errorData);
  }
});

export const registerRoutesInFolder = (folder) => {
  const router = new express.Router();

  // Register all .js files in routes directory as express routes
  readdirSync(folder)
    // Only consider JS files
    .filter((filename) => filename.endsWith(".js") || filename.endsWith(".ts"))
    // Require files and register with express
    .forEach((fileName) => {
      // Add full path to filename
      const filePath = joinPath(folder, fileName);

      // Remove .js from file name to get route name
      const routeName =
        fileName
          .split(".")
          .slice(0, -1)
          .join(".")
      ;

      const routePath = `/${ routeName }`;
      const getHandler = () => {
        const router = require(filePath).default;

        if (router instanceof Router) {
          return router.expose();
        }

        return router;
      };

      router.use(routePath, getHandler());
    })
  ;

  return router;
};

export const registerRoutesInFolderJs =
  (jsFilePath) =>
    registerRoutesInFolder(
      jsFilePath
        .replace(/\.(js|ts)$/i, "")
      ,
    )
;

export const registerFolderAsRoute = (baseDir, folderName) => {
  const router = express.Router();

  router.use(folderName, registerRoutesInFolder(joinPath(baseDir, folderName)));

  return router;
};

export class Router {
  /**
   * @type {express.Router}
   */
  #router = null;

  constructor() {
    this.#router = express.Router();
  }

  /// //////// REQUEST METHODS START ///////////
  all(path, ...handlers) {
    return this.addRoute("all", path, handlers);
  }

  get(path, ...handlers) {
    return this.addRoute("get", path, handlers);
  }

  getRaw(path, ...handlers) {
    return this.addRawRoute("get", path, handlers);
  }

  post(path, ...handlers) {
    return this.addRoute("post", path, handlers);
  }

  postRaw(path, ...handlers) {
    return this.addRawRoute("post", path, handlers);
  }

  put(path, ...handlers) {
    return this.addRoute("put", path, handlers);
  }

  delete(path, ...handlers) {
    return this.addRoute("delete", path, handlers);
  }

  patch(path, ...handlers) {
    return this.addRoute("patch", path, handlers);
  }

  options(path, ...handlers) {
    return this.addRoute("options", path, handlers);
  }

  head(path, ...handlers) {
    return this.addRoute("head", path, handlers);
  }

  /// //////// REQUEST METHODS END ///////////

  use(...handlers) {
    const exposedHandlers =
      handlers
        .map((handler) => {
          if (handler instanceof Router) {
            handler = handler.expose();
          }

          return handler;
        })
    ;

    this.#router.use(...exposedHandlers);

    return this;
  }

  /**
   * Alias for {@link use}
   */
  with(...handlers) {
    return this.use(...handlers);
  }

  /**
   * @param {String} requestMethod
   * @param {String} path
   * @param {Array} handlersList
   *
   * @returns {Router}
   */
  addRoute(requestMethod, path, handlersList) {
    return this.addWrappedRoute(requestMethod, path, handlersList, apiRoute);
  }

  /**
   * @param {String} requestMethod
   * @param {String} path
   * @param {Array} handlersList
   *
   * @returns {Router}
   */
  addRawRoute(requestMethod, path, handlersList) {
    return this.addWrappedRoute(requestMethod, path, handlersList, rawRoute);
  }

  /**
   * @param {String} requestMethod
   * @param {String} path
   * @param {Array} handlersList
   * @param {Function} wrapper
   *
   * @returns {Router}
   */
  addWrappedRoute(requestMethod, path, handlersList, wrapper) {
    const handler = handlersList.pop();

    this.#router[requestMethod](path, ...[ ...handlersList, wrapper(handler) ]);

    return this;
  }

  /**
   * @return {express.Router}
   */
  expose() {
    return this.#router;
  }

  /**
   * @param {express.Router} router
   *
   * @return {Router}
   */
  _setRouter(router) {
    this.#router = router;

    return this;
  }
}

export class AuthRouter extends Router {
  /**
   * @type {express.Router|null}
   */
  #boundRouter = null;

  /**
   * @param {AuthConfig} authConfig
   */
  constructor(authConfig) {
    super();

    this.use(requireAuth(authConfig));
  }

  /**
   * @param {Router|express.Router} newRouter
   * @returns {AuthRouter}
   */
  bindToRouter(newRouter) {
    if (newRouter instanceof Router) {
      this.#boundRouter = newRouter.expose();
    } else {
      this.#boundRouter = newRouter;
    }

    return this;
  }

  /**
   * @param {Router|express.Router} router
   * @param {AuthConfig} authConfig
   * @returns {AuthRouter}
   */
  static boundToRouter(router, authConfig) {
    const self = new this(authConfig);

    return self.bindToRouter(router);
  }

  expose() {
    if (null !== this.#boundRouter) {
      this.#boundRouter.use(super.expose());
      this._setRouter(this.#boundRouter);
      this.#boundRouter = null;
    }

    return super.expose();
  }
}
