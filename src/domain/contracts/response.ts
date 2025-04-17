export class Response<T> {
  constructor(
    public readonly success: boolean,
    public readonly statusCode: number,
    public readonly data?: T,
    public readonly error?: string,
  ) {}
}
