import { Server } from "socket.io";

type ChatSocketHandler = (io: Server) => void;

const chatSocket: ChatSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("join_group", (groupId: string | number) => {
      socket.join(groupId.toString());
      console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on("group_message", (data: { groupId?: string | number; content: string; senderId: number }) => {
      const { groupId, content, senderId } = data;
      if (!groupId) {
        console.warn("Received group_message without groupId");
        return;
      }
      // Отправляем всем в группе сообщение с нужными полями
      io.to(groupId.toString()).emit("group_message", {
        content,
        senderId,
        chatGroupId: groupId,
        sentAt: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default chatSocket;
