// Mở rộng kiểu dữ liệu của Express Request
import { Request } from 'express'
import { TokenPayload } from './@types/users.types'
import User from './models/schemas/User.schema'
declare module 'express' {
  interface Request<ParamsDictionary = any, Body = any, Query = any, P = core.ParamsDictionary> {
    user?: User
    decoded_access_token?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
  }
}
