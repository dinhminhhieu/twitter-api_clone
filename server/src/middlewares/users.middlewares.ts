import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import userService from '~/services/users.services'
import { validate } from '~/utils/validation.utils'

export const registerValidatorMiddleware = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 255
        }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      isLength: {
        options: {
          min: 10,
          max: 255
        }
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await userService.checkEmailExist(value)
          if (isExistEmail) {
            throw new Error('Email đã tồn tại')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Mật khẩu nên chứa tối thiểu 8 kí tự, tối thiểu 1 kí tự là chữ thường, chữ hoa, chữ số và kí tự đặc biệt'
      }
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Mật khẩu nên chứa tối thiểu 8 kí tự, tối thiểu 1 kí tự là chữ thường, chữ hoa, chữ số và kí tự đặc biệt'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Nhập lại password không đúng')
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
        }
      }
    }
  })
)

export const loginValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}
