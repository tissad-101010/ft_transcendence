import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "ws";

import jwt from "jsonwebtoken";
import { chatService } from "../services/chat.service";


interface JwtPayload {
  userId: number;
}

interface SendMessagePayload {
  type: "send_message";
  from: string;
  to: string;
  text: string;
}

type IncomingMessage = SendMessagePayload;

export function handleWebSocketConnection(
  clients: Map<number, WebSocket>
) {
  return async function (connection: any, req: FastifyRequest) {
    const socket: WebSocket = connection.socket;


    const token = (req.query as { token?: string }).token;
    if (!token) {
      socket.close();
      return;
    }
    // valid jwt token with services users
    console.log("========================================================>WebSocket connection with token:", token);
    // let payload: JwtPayload;
    // try {
    //   payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    // } catch {
    //   socket.close();
    //   return;
    // }

    // const userId = payload.userId;

    // clients.set(userId, socket);
    // console.log(`User ${userId} connected via WebSocket`);

    // socket.on("close", () => {
    //   clients.delete(userId);
    //   console.log(`User ${userId} disconnected`);
    // });

    socket.on("message", async (raw: string) => {
      const data = JSON.parse(raw) as IncomingMessage;

      if (data.type === "send_message") {
        const { to, from, text } = data;

        const senderUser = await chatService.getUserByUsername(from);
        if (!senderUser) {
          console.error("Sender user not found:", from);
          return;
        }
        // Register client socket
        clients.set(senderUser.id, socket);
        // Stocker en DB
        const receiperUser = await chatService.getUserByUsername(to);
        if (!receiperUser) {
          console.error("Recipient user not found:", to);
          return;
        }
        console.log("Sending message from", from, "to", to, "text:", text);
        const conversation = await chatService.startConversation(
          senderUser.id,
          receiperUser.id
        );
        // Change name sendMessage to addMessageToConversation/!\
        const message = await chatService.sendMessage(
          conversation.id,
          senderUser.id,
          text
        );

        // Envoyer au destinataire si connecté
        const target = clients.get(receiperUser.id);
        if (target) {
          target.send(
            JSON.stringify({
              type: "new_message",
              message,
            })
          );
        }else {
          console.log("Recipient user not connected:", to);
        }
      }
    });
  };
}
