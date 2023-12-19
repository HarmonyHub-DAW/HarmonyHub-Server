import { Socket } from "socket.io";

export interface ServerToClientEvents {
    'hh:data': (args: { id: string, data: ArrayBuffer }, callback: (res?: { data: ArrayBuffer }) => void) => void;
    'hh:user-disconnected': (args: { id: string }) => void;
}

export interface ClientToServerEvents {
    'hh:create-session': (args: null, callback: (ack: { room: string }) => void) => void;
    'hh:join-session': (args: { room: string }, callback: (ack: { success: boolean }) => void) => void;
    'hh:broadcast': (args: { data: ArrayBuffer }, callback: (res: { id: string, data?: ArrayBuffer }[]) => void) => void;
    'hh:request': (args: { data: ArrayBuffer }, callback: (res: { data: ArrayBuffer | null }) => void) => void;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;