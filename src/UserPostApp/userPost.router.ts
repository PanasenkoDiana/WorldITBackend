import { Router } from 'express'
import { userPostController } from './userPost.controller'
import { authTokenMiddleware } from "../middlewares/authMiddlewares";

const userPost = Router()

userPost.post('/create', authTokenMiddleware, userPostController.createPost)
userPost.post('/delete', authTokenMiddleware, userPostController.deletePost)
userPost.put('/update', authTokenMiddleware, userPostController.updatePost)
userPost.get('/post/:id', userPostController.getPostById)
userPost.get('/all', userPostController.getAllPosts)
userPost.get('/myPosts', authTokenMiddleware, userPostController.getMyPosts)

export default userPost
