// Here is where we gonna check if the user is (optionally) authenticated
import { NextFunction, Request, Response } from "express"
import AppError from "../utils/errors"
import { SECRET } from "../config"
import jwt from "jsonwebtoken"

/**
 * Check if user is (optionally) authenticated to access the next route
 */
export default function optionallyAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenHeader = req.headers.authorization

  if (!tokenHeader) return next()

  const token = (tokenHeader as string).split(" ")[1]

  if (!token) return next()

  try {
    const user = jwt.verify(token, SECRET as string)

    if (!user)
      return new AppError(res, {
        name: "Unauthenticated",
        message: "Token invalid!",
        statusCode: 401,
      })

    req.user = user as object
    next()
  } catch (error) {
    return new AppError(res, {
      name: "Server internal",
      message: "Something went wrong decoding the token!",
      statusCode: 500,
    })
  }
}
