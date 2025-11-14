import { FastifyReply, FastifyRequest } from 'fastify';


export async function testGameController(
  request: FastifyRequest,
  reply: FastifyReply
  
) {
    return reply.code(200).send({
        message: 'backend game yo les ploucs',
    })
}