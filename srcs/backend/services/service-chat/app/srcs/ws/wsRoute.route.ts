import { FastifyInstance } from "fastify";
import { handleWebSocketConnection } from "../ws/handleWebSocketConnection";
import { WebSocket } from "ws";

export async function wsRoutes(app: FastifyInstance) {
  // console.log("Registering WebSocket routes...");

  const clients = new Map<string, WebSocket>();

  app.get(
    "/ws",
    { websocket: true },
    // cast to any to satisfy Fastify's handler type for websocket routes
    handleWebSocketConnection(clients)
  );

}

