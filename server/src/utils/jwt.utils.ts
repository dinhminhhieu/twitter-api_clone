import jwt, { SignOptions } from 'jsonwebtoken'
import env from '~/config/environment.env'

export const signToken = ({
  payload,
  secretKey = env.JWT_SECRET_KEY as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  secretKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secretKey, options, (error, token) => {
      if (error) throw reject(error)
      resolve(token as string)
    })
  })
}
