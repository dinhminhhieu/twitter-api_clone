import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import env from './config/environment.env'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

const app = express()

const port = env.PORT

app.use(express.json())
app.use('/users', usersRouter)

app.use(defaultErrorHandler)

databaseService.dbConnect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
