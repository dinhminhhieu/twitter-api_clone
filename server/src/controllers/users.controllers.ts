import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { access } from 'fs'
import { ObjectId } from 'mongodb'
import { LogoutRequestBody, RefreshTokenRequestBody, RegisterRequestBody, TokenPayload } from '~/@types/users.types'
import env from '~/config/environment.env'
import { HttpStatusCode } from '~/constants/enums'
import { userErrorMessages, userSuccessMessages } from '~/constants/messages'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await userService.register(req.body)
    return res.status(HttpStatusCode.Created).json({
      message: userSuccessMessages.REGISTER_SUCCESS,
      data
    })
  } catch (error) {
    next(error)
  }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User
    const user_id = user._id as ObjectId
    const data = await userService.login({ user_id: user_id.toString(), verify: user.verify })
    return res.status(HttpStatusCode.Ok).json({
      message: userSuccessMessages.LOGIN_SUCCESS,
      data
    })
  } catch (error) {
    next(error)
  }
}

export const oauthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  const data = await userService.loginWithGoogle(code as string)
  const urlRedirect = `${env.CLIENT_REDIRECT_CALLBACK}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&new_user=${data.newUser}`
  console.log(urlRedirect)
  return res.redirect(urlRedirect)
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body
    const data = await userService.logout(refresh_token)
    return res.status(HttpStatusCode.Ok).json(data)
  } catch (error) {
    next(error)
  }
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body
    const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
    const data = await userService.refreshToken({ user_id, verify, refresh_token, exp })
    return res.status(HttpStatusCode.Ok).json({
      message: userSuccessMessages.REFRESH_TOKEN_SUCCESS,
      data
    })
  } catch (error) {
    next(error)
  }
}

export const emailVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.decoded_email_verify_token as TokenPayload
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    // Nếu không tìm thấy user thì trả về status 404 với message là 'Người dùng không tồn tại'
    if (user === null) {
      return res.status(HttpStatusCode.NotFound).json({
        message: userErrorMessages.USER_NOT_FOUND
      })
    }
    // Nếu đã verify email rồi thì chuyển email_verify_token thành chuỗi rỗng và trả về status 200 với message là 'Email đã được xác thực trước đó'
    if (user.email_verify_token === '') {
      return res.status(HttpStatusCode.Ok).json({
        message: userErrorMessages.EMAIL_VERIFIED_BEFORE
      })
    }
    const data = await userService.verifyEmail(user_id)
    return res.status(HttpStatusCode.Ok).json({
      message: userSuccessMessages.EMAIL_VERIFY_SUCCESS,
      data
    })
  } catch (error) {
    next(error)
  }
}
