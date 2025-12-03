import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "ws";
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


export function handleWebSocketConnection(
  clients: Map<number, WebSocket>
) {
  return async function (connection: WebSocket, req: FastifyRequest) {

    const socket = connection;

    if (!socket) {
      console.error("WebSocket connection error: WebSocket not established");
      return;
    }
    // extract cookies from request headers
    const cookies = req.headers.cookie ?? "";
    // console.log("WebSocket connection established. Cookies:", cookies);
    // extarct access_token from cookies
    const accessToken: string =
      cookies
        .split("; ")
        .find((row: string) => row.startsWith("access_token="))
        ?.split("=")[1] || "";
    console.log("Extracted access token:", accessToken);


    
    socket.on("message", async (raw: string) => {
      const data = JSON.parse(raw);
      console.log("==============================================>Received WS message:", data);
      if (data.type === "init_connection") {
        const {from} = data;
        console.log("===================================================>Processing to connecting user:", from);
        let senderUser = await chatService.getUserByUsername(from);
        if (!senderUser) 
        {
          console.log("create user:", from);
          senderUser = await chatService.addUser(from);
          if (!senderUser) {
            console.log("Failed to create sender user:", from);
            return;
          }
        }

        clients.set(senderUser.id, socket);
        console.log("User connected:", from, "with ID:", senderUser.id);
      }

      if (data.type === "send_message") {
        const { to, from, text } = data;
        console.log("================>Processing send_message from", from, "to", to, "text:", text);
        let senderUser = await chatService.getUserByUsername(from);
        if (!senderUser) 
        {
          console.log("Failed to create sender user:", from);
          return;
        }

        let receiperUser = await chatService.getUserByUsername(to);
        if (!receiperUser)
        {
          console.log("create user:", to);
          receiperUser = await chatService.addUser(to);
          if (!receiperUser) {
            console.log("Failed to create recipient user:", to);
            return;
          }
        }

        console.log("Sending message from", from, "to", to, "text:", text);

        const conversation = await chatService.startConversation(
          senderUser.id,
          receiperUser.id
        );

        const message = await chatService.sendMessage(
          conversation.id,
          senderUser.id,
          text,
          from,
          to
        );
         if (!message) {
          console.log("Failed to send message from", from, "to", to);
          return;
        }
        const target = clients.get(receiperUser.id);
        if (target) {
          console.log("Sending message to recipient user:", to);
          console.log(to + " is connected, sending message...");
          target.send(JSON.stringify({
            type: "new_message",
            message,
          }));
        } else {
          console.log("Recipient user not connected:", to);
        }
      }
    });

  };
}
