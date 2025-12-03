import { FastifyInstance } from "fastify";

import { handleWebSocketConnection } from "../ws/handleWebSocketConnection";
import { WebSocket } from "ws";

export async function wsRoutes(app: FastifyInstance) {


  // 2. Map des clients connectés
  const clients = new Map<number, WebSocket>();

  // 3. Route WS
  app.get(
    "/ws",
    { websocket: true },
    handleWebSocketConnection(clients)
  );
}
