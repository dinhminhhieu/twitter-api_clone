import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'dinhminhhieu@gmail.com' && password === '123123') {
    return res.status(200).json({
      message: 'Login success'
    })
  }
  return res.status(400).json({
    error: 'Login failed. Email or password wrong!'
  })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const data = await userService.register({ email, password })
    return res.status(200).json({
      message: 'Register success',
      data
    })
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed!'
    })
  }
}
