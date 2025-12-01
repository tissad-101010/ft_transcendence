

export class UserNotFoundError extends Error
{
    constructor()
    {
        super("User not found");
        this.name = "UserNotFoundError";
    }
};

export class DataBaseConnectionError extends Error
{
    constructor()
    {
        super("Database connection error");
        this.name = "DataBaseConnectionError";
    }
};