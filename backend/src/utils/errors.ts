import { Response } from "express"

type ErrorData = {
  name: string
  message: string
  statusCode: number
}

export default class AppError extends Error {
  public readonly name
  public readonly statusCode

  constructor(res: Response, { name, message, statusCode }: ErrorData) {
    super(message)

    this.name = name
    this.statusCode = statusCode

    res.status(statusCode).send({
      message,
      error: name,
    })
  }
}
