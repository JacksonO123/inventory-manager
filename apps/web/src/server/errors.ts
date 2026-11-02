export type HttpErrorStatus = 404 | 409;

export class HttpError extends Error {
  status: HttpErrorStatus;

  constructor(status: HttpErrorStatus, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
