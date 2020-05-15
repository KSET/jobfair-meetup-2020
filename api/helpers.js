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
 * @property {*} additionalData - Any response data
 */


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
 * @param {*} additionalData
 * @returns {ErrorResponse}
 */
export const error = ({ reason, status = 403, additionalData = null }) => ({
  error: true,
  status,
  reason,
  additionalData,
});


export class ApiError extends Error {
  statusCode = 403;

  additionalData = null;

  constructor(message, statusCode, additionalData = null) {
    super(message);
    this.statusCode = status;
    this.additionalData = additionalData;
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
    const result = await fn(req, res);

    return res.json(success(result));
  } catch (e) {
    if (e.statusCode) {
      res.status(e.statusCode);
    }

    res.json(error({
      status: res.statusCode,
      reason: e.message,
      additionalData: e.additionalData,
    }));

    return next(e);
  }
});
