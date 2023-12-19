import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./packets";

export function analytics(socket: Socket<ClientToServerEvents, ServerToClientEvents>, next: () => void) {
    console.log("received: " + socket.request.readableLength);
    next();
}