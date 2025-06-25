import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../../../config/token';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
const secretKey = SECRET_KEY

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: 'Failed to authenticate token' });
            return;
        }

        req.user = decoded;
        next();
    });
};