export const sessions = new Set<string>();

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
    sessions.add(token);
    return token;
}

export function removeSession(token: string): boolean {
    return sessions.delete(token);
}