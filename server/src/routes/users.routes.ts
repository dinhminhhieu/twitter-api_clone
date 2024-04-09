import { Router } from 'express'
import { emailVerifyController, loginController, logoutController, oauthController, refreshTokenController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidatorMiddleware,
  emailVerifyValidatorMiddleware,
  loginValidatorMiddleware,
  refreshTokenValidatorMiddleware,
  registerValidatorMiddleware
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler.utils'
const usersRouter = Router()

/**
 * 1. Register
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidatorMiddleware, wrapRequestHandler(registerController))

/**
 * 2. Login
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: {email: string, password: string }
 */
usersRouter.post('/login', loginValidatorMiddleware, wrapRequestHandler(loginController))

/**
 * 3. Login with Google
 * Description: Oauth login with google
 * Path: /oauth/google
 * Method: GET
 * Query: {code: string}
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

/**
 * 4. Logout
 * Description: Logout user
 * Path: /logout
 * Method: POST
 * Headers: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string}
 */
usersRouter.post(
  '/logout',
  accessTokenValidatorMiddleware,
  refreshTokenValidatorMiddleware,
  wrapRequestHandler(logoutController)
)

/**
 * 5. Verify Email
 * Description: verify email when user registers
 * Path: /verify-email
 * Method: POST
 * Body: {email_verify_token: string}
 */

usersRouter.post('/verify-email', emailVerifyValidatorMiddleware, wrapRequestHandler(emailVerifyController))

/**
 * 6. Refresh Token
 * Description: Refresh access token
 * Path: /refresh-token
 * Method: POST
 * Body: {refresh_token: string}
 */

usersRouter.post('/refresh-token', refreshTokenValidatorMiddleware, wrapRequestHandler(refreshTokenController))

export default usersRouter
