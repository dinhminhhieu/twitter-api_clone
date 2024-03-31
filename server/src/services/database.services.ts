import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import env from '~/config/environment.env'
import User from '~/models/schemas/User.schema'

const uri = `mongodb+srv://${env.MONGODB_USERNAME}:${env.MONGODB_PASSWORD}@twitterapi.ivi7mba.mongodb.net/?retryWrites=true&w=majority&appName=twitterapi`

class DatabaseService {
  private client: MongoClient
  private database: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.database = this.client.db(env.MONGODB_NAME)
  }
  async dbConnect() {
    try {
      await this.database.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error: ', error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.database.collection(env.MONGODB_USERS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
