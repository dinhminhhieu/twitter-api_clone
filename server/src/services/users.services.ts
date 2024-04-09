import { RegisterRequestBody } from '~/@types/users.types'
import { hashPassword } from '~/utils/crypto.utils'
import { signToken, verifyToken } from '~/utils/jwt.utils'
import { HttpStatusCode, TokenType, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import env from '~/config/environment.env'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { userErrorMessages, userSuccessMessages } from '~/constants/messages'
import axios from 'axios'
import { ErrorWithStatus } from '~/models/Errors'

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      secretKey: env.JWT_ACCESS_TOKEN_SECRET_KEY as string,
      options: {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        },
        secretKey: env.JWT_REFRESH_TOKEN_SECRET_KEY as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      secretKey: env.JWT_REFRESH_TOKEN_SECRET_KEY as string,
      options: {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private async decodeRefreshToken(refresh_token: string) {
    const decode_refresh_token = await verifyToken({
      token: refresh_token,
      secretKey: env.JWT_REFRESH_TOKEN_SECRET_KEY as string
    })
    return decode_refresh_token
  }

  async signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      secretKey: env.JWT_EMAIL_VERIFY_TOKEN_SECRET_KEY as string,
      options: {
        expiresIn: env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const isExistEmail = await databaseService.users.findOne({ email })
    return Boolean(isExistEmail)
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return {
      access_token,
      refresh_token
    }
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getOauthGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      name: string
      picture: string
      given_name: string
      family_name: string
      verified_email: boolean
      locale: string
    }
  }

  async loginWithGoogle(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getOauthGoogleUserInfo(access_token, id_token)
    if (!userInfo.email) {
      throw new ErrorWithStatus({
        status: HttpStatusCode.BadRequest,
        message: userErrorMessages.GOOGLE_EMAIL_NOT_EXIST
      })
    }
    // Kiểm tra email đã tồn tại trong database chưa
    const user = await databaseService.users.findOne({ email: userInfo.email })
    // Nếu tồn tại thì login vào hệ thống
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ user_id: user._id, token: refresh_token, iat, exp })
      )
      return {
        access_token,
        refresh_token,
        verify: user.verify,
        newUser: 0
      }
    } else {
      // random string password
      const password = Math.random().toString(36).substring(2, 15)
      // không thì đăng ký
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })
      return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified }
    }
  }

  async findUser(email: string, password: string) {
    const existUser = await databaseService.users.findOne({ email, password: hashPassword(password) })
    return existUser
  }

  async checkRefreshTokenExist(refresh_token: string) {
    const existRefreshToken = await databaseService.refreshTokens.findOne({ token: refresh_token })
    return existRefreshToken
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: userSuccessMessages.LOGOUT_SUCCESS
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async verifyEmail(user_id: string) {
    const update_email_verify_token = databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { email_verify_token: '', verify: UserVerifyStatus.Verified },
        $currentDate: {
          updated_at: true
        }
      }
    )
    const email_verify_token = this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified })
    await Promise.all([update_email_verify_token, email_verify_token])
    const [access_token, refresh_token] = await email_verify_token
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return {
      access_token,
      refresh_token
    }
  }
}

const userService = new UsersService()
export default userService
