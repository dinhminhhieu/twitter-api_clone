import { NextFunction, Request, Response } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { HttpStatusCode } from '~/constants/enums'
import { ErrorWithStatus, UnprocessableEntityError } from '~/models/Errors'

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      await validation.run(req)
    }
    const errors = validationResult(req)
    if (errors.isEmpty()) return next() // Nếu không có lỗi thì next handler reqquest
    const errorsObject = errors.mapped()
    const unprocessableEntityError = new UnprocessableEntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HttpStatusCode.UnprocessableEntity) return next(msg) // Trả về lỗi không phải lỗi validate
      unprocessableEntityError.errors[key] = errorsObject[key]
    }
    next(unprocessableEntityError) // Trả về lỗi do validate
  }
}
