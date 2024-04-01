import { createHash } from 'crypto'
import env from '~/config/environment.env'

const sha256 = (content: string) => {
  return createHash('sha256').update(content).digest('hex')
}

export const hashPassword = (password: string) => {
  return sha256(password + env.SALT_PASSWORD)
}
