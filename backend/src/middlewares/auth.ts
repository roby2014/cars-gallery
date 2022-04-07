import { SECRET } from "../config"
import jwt from "jsonwebtoken"

interface UserEssentials {
  id: number
  email: string
}

/**
 * Generate token by the user provided
 * @param user The user object
 */
export function generateToken(user: UserEssentials) {
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET as string, {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
  })

  return token
}
