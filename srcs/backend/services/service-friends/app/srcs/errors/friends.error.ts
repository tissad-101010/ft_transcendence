
import { FastifyReply} from "fastify";

export function handleError(reply: FastifyReply, err: unknown)
{
    if (err instanceof AuthError) return reply.code(401).send({ success: false, message: err.message });
    if (err instanceof UserNotFoundError) return reply.code(404).send({ success: false, message: err.message });
    if (err instanceof InvitationError) return reply.code(409).send({ success: false, message: err.message });
    if (err instanceof RemoteServiceUnavailableError) return reply.code(503).send({ success: false, message: err.message });

    console.error("Unexpected error:", err);
    return reply.code(500).send({ success: false, message: "Internal server error" });
}

export class DataBaseConnectionError extends Error
{
    constructor()
    {
        super("Database connection error");
        this.name = "DataBaseConnection";
    }
};

export class RemoteServiceUnavailableError extends Error
{
    constructor()
    {
        super("Service user unavailable");
        this.name = "RemoteServiceUserUnavailable";
    }
};

export class AuthError extends Error
{
    constructor(message = "Authentification failed")
    {
        super(message);
        this.name = "AuthError";
    }
}

export class InvitationError extends Error
{
    constructor(message: string)
    {
        super(message);
        this.name = "InvitationError";
    }
}

export class UserNotFoundError extends Error
{
    constructor(username: string)
    {
        super(username ? `${username} doesn't exist` : "User unknown");
        this.name = "UserNotFoundError";
    }
}