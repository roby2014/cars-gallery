import { Request, Response, NextFunction } from "express"

export default async function checkLocale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    req.query?.lang &&
    req.i18n.languages.indexOf(req.query.lang as string) !== -1
  ) {
    req.i18n.changeLanguage(req.query.lang as string)
  }

  next()
}
