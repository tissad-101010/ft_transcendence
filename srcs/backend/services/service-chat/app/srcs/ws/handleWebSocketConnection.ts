import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { chatService } from "../services/chat.service";
import { usersClient,
         serviceUsersURL
 } from "../usersClient";


interface JwtPayload {
  userId: number;
  email: string;
}

type MessagePayload =
  | { type: "send_message"; from: string; to: string; text: string }
  | { type: "init_connection", from: string };

// Initialize a new WebSocket connection
// Store the connection in the clients map

async function initConnection(
  clients: Map<string, WebSocket>,
  username: string,
  socket: WebSocket
): Promise<void> {
  console.log("===================================================>Processing to connecting user:", username);
  let senderUser = await chatService.getUserByUsername(username);
  if (!senderUser) 
  {
    console.log("create user:", username);
    senderUser = await chatService.addUser(username);
    if (!senderUser) {
      console.log("Failed to create sender user:", username);
      return;
    }
  }
  clients.set(username, socket);
  console.log("User connected:", username, "with ID:", senderUser.id);
}


// Close an existing WebSocket connection
// Remove the connection from the clients map
async function closeConnection(
  clients: Map<string, WebSocket>,
  username: string
): Promise<void> {
  console.log("===================================================>Processing to disconnecting user:", username);
  let senderUser = await chatService.getUserByUsername(username);
  if (!senderUser) 
  {
    console.log("User not found during disconnection:", username);
    return;
  }
  clients.delete(username);
  console.log("User disconnected:", username, "with ID:", senderUser.id);
}


// send a message to a specific user
async function sendMessageToUser(
  clients: Map<string, WebSocket>,
  toUsername: string,
  message: any
): Promise<void> {
  console.log("===================================================>Processing to send message to user:", toUsername);
  const targetSocket = clients.get(toUsername);
  if (targetSocket) {
    targetSocket.send(JSON.stringify(message));
    console.log("Message sent to user:", toUsername);
  }else{
    console.log("User not connected:", toUsername);
  }
}


// store message in database
async function storeMessageInDb(
  senderId: number,
  receiverId: number,
  content: string,
  senderUsername: string,
  receiverUsername: string
): Promise<any> {
  const conversation = await chatService.findConversationBetween(
    senderId,
    receiverId,
  );
  if (!conversation) {
    throw new Error("Conversation not found");
  }
  const conversationId = conversation.id;
  console.log("====================================================>Storing message in DB for conversation ID:", conversationId);
  return await chatService.storeMessageInDb(
    conversationId,
    senderId,
    content,
    senderUsername,
    receiverUsername
  );
}

// extract access token from cookies
function extractAccessToken(cookies: string): string {
  console.log("====================================================>Extracting access token from cookies:", cookies);
  const accessToken = cookies
    .split("; ")
    .find((row: string) => row.startsWith("access_token="))
    ?.split("=")[1] || "";
  console.log("===================================================>Extracted access token:", accessToken);
  return accessToken;
}

// verify access token and return json object with userId and email type any  or null
async function verifyAccessToken(token: string): Promise<any | null> {
  console.log("===================================================>Verifying access token:", token);
 if (!token) {
    console.error("No access token provided");
    return null;
  }
  const res = await usersClient.post(`${serviceUsersURL}/internal/verify-token`, { token });
  if (res.status !== 200) {
    console.error("Access token verification failed with status:", res.status, "and data:", res.data);
    return null;
  }
  console.log("Access token verified successfully:", res.data);
  return (res.data);
}

// WebSocket connection handler
export function handleWebSocketConnection(
  clients: Map<string, WebSocket>
) {
  return async function (connection: WebSocket, req: FastifyRequest) {

    const socket = connection;

    if (!socket) {
      console.error("WebSocket connection error: WebSocket not established");
      return;
    }
    // extract cookies from request headers
    const cookies = req.headers.cookie ?? "";
    const accessToken = extractAccessToken(cookies);
    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      console.error("WebSocket connection error: Invalid access token");
      socket.close(1008, "Invalid access token");
      return;
    }
    else {
      console.log("WebSocket connection established for user ID:", payload.userId, "email:", payload.email);
    }
    socket.on("message", async (data: WebSocket.Data) => {
    console.log("===================================================>WebSocket message received:", data.toString());
    //   try {
    //     const message: MessagePayload = JSON.parse(data.toString());
    //     if (message.type === "init_connection") {
    //       await initConnection(clients, message.from, socket);
    //       console.log("=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>WebSocket init_connection processed for username:", message.username);
    //     }
    //   }catch (err) {
    //     console.error("WebSocket message handling error:", err);
    //   }
    // });

    // socket.on("close", async () => {
    //   await closeConnection(clients, payload.email);
    });
  }
}
