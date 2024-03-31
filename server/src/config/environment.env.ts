import 'dotenv/config'

const env = {
  PORT: process.env.PORT,
  MONGODB_NAME: process.env.MONGODB_NAME,
  MONGODB_USERNAME: process.env.MONGODB_USERNAME,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
  MONGODB_USERS_COLLECTION: process.env.MONGODB_USERS_COLLECTION
}

export default env
