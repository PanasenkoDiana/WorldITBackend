import { Router } from 'express';
import {ChatController} from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authTokenMiddleware } from '../../../middlewares/authMiddlewares';

const chatRouter = Router();
const chatController = new ChatController();

chatRouter.post('/messages', authenticate, chatController.sendMessage);
chatRouter.get('/messages/:chatId', authenticate, chatController.getChatHistory);
chatRouter.post('/get-or-create-group', authenticate, chatController.getOrCreateChatGroup);
chatRouter.get('/all', authTokenMiddleware, chatController.getAllChats)
chatRouter.post('/create-group', authenticate, chatController.createGroup);

export default chatRouter;