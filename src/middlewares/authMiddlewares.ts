import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { SECRET_KEY } from '../config/token'

interface IToken {
  iat: number
  exp: number
  id: number
}

export function authTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization
  console.log('authorization', authorization)

  if (!authorization) {
    res.status(401).json({ status: 'error', message: 'authorization required' })
    return
  }

  const [type, token] = authorization.split(' ')
  if (type !== 'Bearer' || !token) {
    res.status(401).json({ status: 'error', message: 'authorization is invalid' })
    return
  }

  try {
    const decodedToken = verify(token, SECRET_KEY) as IToken
    res.locals.userId = decodedToken.id
    next()
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'token is invalid' })
  }
}
