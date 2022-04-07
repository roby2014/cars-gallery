// Here is where we gonna check if the user is authenticated to access the route or not

import { NextFunction, Request, Response } from "express"
import AppError from "../utils/errors"
import { SECRET } from "../config"
import jwt from "jsonwebtoken"

/**
 * Check if user is authenticated to access the next route
 */
export default function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenHeader = req.headers.authorization

  if (!tokenHeader) return new AppError(res, {
    name: "Unauthenticated",
    message: "No header provided, try log in!",
    statusCode: 401
  })

  const token = (tokenHeader as string).split(" ")[1]

  if (!token)
    return new AppError(res, {
      name: "Unauthenticated",
      message: "You need to login to get a token!",
      statusCode: 401,
    })

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
      name: "Unauthenticated",
      message: "Something went wrong decoding the token!",
      statusCode: 401,
    })
  }
}
