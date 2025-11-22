
export class InvitationAlreadyExistsError extends Error
{
    constructor()
    {
        super("Invitation already exists");
        this.name = "InvitationAlreadyExists";
    }
};

export class DataBaseConnectionError extends Error
{
    constructor()
    {
        super("Database connection error");
        this.name = "DataBaseConnection";
    }
};

export class RemoteUserNotFoundError extends Error
{
    constructor(username: string)
    {
        super(`User not found -> ${username}`);
        this.name = "RemoteUserNotFound";
    }
};

export class RemoteServiceUserUnavailableError extends Error
{
    constructor()
    {
        super("Service user unavailable");
        this.name = "RemoteServiceUserUnavailable";
    }
};