import { RegisterRequestBody } from '~/@types/users.types'
import { hashPassword } from '~/utils/crypto.utils'
import { signToken } from '~/utils/jwt.utils'
import { TokenType } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import env from '~/config/environment.env'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  async register(payload: RegisterRequestBody) {
    const data = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const user_id = data.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const isExistEmail = await databaseService.users.findOne({ email })
    return Boolean(isExistEmail)
  }
}

const userService = new UsersService()
export default userService
