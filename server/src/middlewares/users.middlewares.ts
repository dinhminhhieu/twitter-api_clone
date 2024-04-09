import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation.utils'
import { userErrorMessages } from '~/constants/messages'
import { verifyToken } from '~/utils/jwt.utils'
import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatusCode } from '~/constants/enums'
import { JsonWebTokenError } from 'jsonwebtoken'
import { Request } from 'express'
import userService from '~/services/users.services'
import env from '~/config/environment.env'

export const registerValidatorMiddleware = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: userErrorMessages.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: userErrorMessages.NAME_MUST_BE_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: userErrorMessages.NAME_LENGTH_MUST_BE_FROM_1_TO_255
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: userErrorMessages.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: userErrorMessages.EMAIL_IS_INVLID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(userErrorMessages.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: userErrorMessages.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: userErrorMessages.PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: userErrorMessages.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: userErrorMessages.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: userErrorMessages.CONFIRM_PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: userErrorMessages.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(userErrorMessages.CONFIRM_PASSWORD_WRONG)
            }
            return true
          }
        }
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: userErrorMessages.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

export const loginValidatorMiddleware = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: userErrorMessages.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: userErrorMessages.EMAIL_IS_INVLID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.findUser(value, req.body.password)
            if (user === null) throw new Error(userErrorMessages.EMAIL_OR_PASSWORD_WRONG)
            ;(req as Request).user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: userErrorMessages.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: userErrorMessages.PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: userErrorMessages.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidatorMiddleware = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: userErrorMessages.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                status: HttpStatusCode.Unauthorized,
                message: userErrorMessages.ACCESS_TOKEN_IS_REQUIRED
              })
            }
            try {
              const decoded_access_token = await verifyToken({
                token: access_token,
                secretKey: env.JWT_ACCESS_TOKEN_SECRET_KEY as string
              })
              ;(req as Request).decoded_access_token = decoded_access_token
            } catch (error) {
              throw new ErrorWithStatus({
                status: HttpStatusCode.Unauthorized,
                message: userErrorMessages.ACCESS_TOKEN_IS_INVALID
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidatorMiddleware = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: userErrorMessages.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_refresh_token = await verifyToken({
                token: value,
                secretKey: env.JWT_REFRESH_TOKEN_SECRET_KEY as string
              })
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
              const refresh_token = await userService.checkRefreshTokenExist(value)
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  status: HttpStatusCode.Unauthorized,
                  message: userErrorMessages.REFRESH_TOKEN_NOT_EXIST
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HttpStatusCode.Unauthorized,
                  message: userErrorMessages.REFRESH_TOKEN_IS_INVALID
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyValidatorMiddleware = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: userErrorMessages.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretKey: env.JWT_EMAIL_VERIFY_TOKEN_SECRET_KEY as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                status: HttpStatusCode.Unauthorized,
                message: (error as JsonWebTokenError).message
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
