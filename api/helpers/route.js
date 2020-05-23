/**
 * @typedef {Object} SuccessResponse
 * @property {boolean} error - Whether an error occurred
 * @property {number} status - The response status code (200 - OK, everything else - error)
 * @property {*} data - Any response data
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} error - Whether an error occurred
 * @property {number} status - The response status code (200 - OK, everything else - error)
 * @property {string} reason - The reason for the error (eg. error text)
 * @property {*} errorData - Any response data
 */


import {
  readdirSync,
} from "fs";
import {
  join as joinPath,
} from "path";
import {
  Router,
} from "express";

/**
 * @param {*} data
 * @returns {SuccessResponse}
 */
export const success = (data) => ({
  error: false,
  status: 200,
  data,
});

/**
 * @param {number} status
 * @param {string} reason
 * @param {*} data
 * @returns {ErrorResponse}
 */
export const error = ({ reason, status = 403, data = null }) => ({
  error: true,
  status,
  data: null,
  reason,
  errorData: data,
});


export class ApiError extends Error {
  statusCode;

  data;

  constructor(message, statusCode = 418, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}


export const asyncWrapper = (fn) => (...args) => {
  return (
    Promise
      .resolve(fn(...args))
      .catch(args.pop())
  );
};


export const apiRoute = (fn) => asyncWrapper(async (req, res, next) => {
  try {
    const result = await fn(req, res, next);

    return res.json(success(result));
  } catch (e) {
    if (e.statusCode) {
      res.status(e.statusCode);
    } else {
      res.status(403);
    }

    const errorData = error({
      status: res.statusCode,
      reason: e.message,
      data: e.data,
    });

    if ("development" === process.env.NODE_ENV && !(e instanceof ApiError)) {
      errorData._errorObject = e;
    }

    return res.json(errorData);
  }
});

export const registerRoutesInFolder = (folder) => {
  const router = new Router();

  // Register all .js files in routes directory as express routes
  readdirSync(folder)
    // Only consider JS files
    .filter((filename) => filename.endsWith(".js"))
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

      // Register route
      router.use(`/${ routeName }`, require(filePath).default);
    })
  ;

  return router;
};

export const registerFolderAsRoute = (baseDir, folderName) => {
  const router = new Router();

  router.use(folderName, registerRoutesInFolder(joinPath(baseDir, folderName)));

  return router;
};
