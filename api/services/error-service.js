export class ServiceError extends Error {
  data;

  statusCode;

  constructor(message, data = null, status = null) {
    super(message);

    this.data = data;
    this.statusCode = status;
  }
}
