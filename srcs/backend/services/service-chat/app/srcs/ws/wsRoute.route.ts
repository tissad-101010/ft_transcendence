import { FastifyInstance } from "fastify";
import { FastifyRequest } from "fastify";
import { handleWebSocketConnection } from "../ws/handleWebSocketConnection";
import { WebSocket } from "ws";

export async function wsRoutes(app: FastifyInstance, request: FastifyRequest) {

  // 1. get cookies from header
  const cookies = request.headers.cookie;
  const token = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("token="))
    ?.split("=")[1];  
  // 2. Map des clients connectés
  const clients = new Map<number, WebSocket>();

  // 3. Route WS
  app.get(
    "/ws",
    { websocket: true },
    handleWebSocketConnection(clients/* , token */)
  );
}
