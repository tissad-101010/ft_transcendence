"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseConnectionError = exports.UserNotFoundError = void 0;
class UserNotFoundError extends Error {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}
exports.UserNotFoundError = UserNotFoundError;
;
class DataBaseConnectionError extends Error {
    constructor() {
        super("Database connection error");
        this.name = "DataBaseConnectionError";
    }
}
exports.DataBaseConnectionError = DataBaseConnectionError;
;
