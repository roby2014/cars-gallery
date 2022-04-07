import { Request, Response } from "express"

import database from "../database"
import AppError from "../utils/errors"

export default {
  index: async function (req: Request, res: Response) {
    try {
      const tags = await database.tag.findMany()

      res.send(tags)
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
}
