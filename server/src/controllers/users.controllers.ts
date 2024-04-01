import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterRequestBody } from '~/@types/users.types'
import userService from '~/services/users.services'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  try {
    const data = await userService.register(req.body)
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
