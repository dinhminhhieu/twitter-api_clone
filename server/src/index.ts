import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import env from './config/environment.env'

const app = express()

const port = env.PORT

app.use(express.json())
app.use('/users', usersRouter)

databaseService.dbConnect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
