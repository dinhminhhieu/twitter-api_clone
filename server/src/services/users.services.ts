import User from '~/models/schemas/User.schema'
import databaseService from './database.services'

class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload
    const data = await databaseService.users.insertOne(
      new User({
        email,
        password
      })
    )
    return data
  }
}

const userService = new UsersService()
export default userService
