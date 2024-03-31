import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidationMiddleware } from '~/middlewares/users.middlewares'
const usersRouter = Router()

usersRouter.post('/login', loginValidationMiddleware, loginController)
usersRouter.post('/register', registerController)

export default usersRouter
