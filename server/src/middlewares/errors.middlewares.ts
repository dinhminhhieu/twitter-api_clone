import { NextFunction, Request, Response } from 'express'
import { HttpStatusCode } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import omit from 'lodash/omit'

// Middleware xử lý lỗi trả về response
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(HttpStatusCode.InternalServerError).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}
