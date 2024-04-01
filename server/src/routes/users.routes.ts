import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidatorMiddleware, registerValidatorMiddleware } from '~/middlewares/users.middlewares'
import { validate } from '~/utils/validation.utils'
const usersRouter = Router()

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidatorMiddleware, registerController)
usersRouter.post('/login', loginValidatorMiddleware, loginController)

export default usersRouter
