import { Server } from "socket.io";

export interface ServerToClientEvents {
    
}

export interface ClientToServerEvents {
    'hh:create-session': (args: { name: string }, callback: (ack: { token: string }) => void) => void;
    'hh:join-session': (args: { name: string, id: string }, callback: (ack: { success: boolean }) => void) => void;
}