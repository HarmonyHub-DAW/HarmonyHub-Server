import { TypedSocket as Socket } from "./websocket/packets";

export const sessions = new Map<string, Array<Socket>>();
export const sockets = new Map<Socket, string>();

export function createToken() : string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let string = '';
    for (let i = 0; i < 12; i++) {
        string += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return string;
}

export function createSession(): string {
    let token = createToken();
    let iterations = 0;
    while (sessions.has(token)) {
        token = createToken();
        if (iterations++ > 100) {
            console.warn("Failed to create session token after 100 iterations");
        }
    }
    sessions.set(token, []);
    return token;
}

export function tryRemoveSession(room: string): boolean {
    if (sessions.get(room)?.length === 0) {
        return removeSession(room);
    }
    return false;
}

export function removeSession(token: string): boolean {
    return sessions.delete(token);
}