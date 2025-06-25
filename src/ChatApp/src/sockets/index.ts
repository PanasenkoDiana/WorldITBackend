import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import ChatSocket from "./chat.socket";

export const initializeSockets = (server: HttpServer) => {
    const io = new Server(server);

    ChatSocket(io);

    return io;
};

export default initializeSockets;