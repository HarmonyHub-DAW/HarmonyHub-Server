import { Server } from "socket.io";
import { App as MicroWebSockets, TemplatedApp } from "uWebSockets.js";
import createLogger from 'logging';
import { createId, createSession, sessions, sockets, tryRemoveSession } from "../sessions";
import { ClientToServerEvents, ServerToClientEvents } from "./packets";
import config from "../dotenv";
import { analytics } from "./analytics";
import { ArrayElement } from "../array";

const log = createLogger('WebSocket');

export const io = new Server<ClientToServerEvents, ServerToClientEvents>({
    transports: ["websocket", "polling"],
    cors: {
        allowedHeaders: ["Content-Type", "Authorization"],
        origin: config.clientOrigin
    }
});

export function setup(): TemplatedApp {
    log.info("Setting up websocket");
    const uws = MicroWebSockets();
    io.attachApp(uws);
    io.use(analytics);
    initEvents();
    return uws;
}

function copyArrayBuffer(data: ArrayBuffer) {
    return new Uint8Array([... new Uint8Array(data)]).buffer;
}

export function initEvents() {
    io.on("connection", (socket) => {
        socket.on('hh:create-session', (_, cb) => {
            const room = createSession();
            const id = createId(room);
            log.info("[create]", id, room);
            sessions.get(room)!.push([socket, id]);
            sockets.set(socket, [room, id]);
            socket.join(room);
            cb({ room: room })
        });

        socket.on('hh:join-session', (props, cb) => {
            const session = sessions.get(props.room);
            if (!session) return cb({ success: false });
            const id = createId(props.room);
            log.info("[join]", id, props);
            session.push([socket, id]);
            sockets.set(socket, [props.room, id]);
            socket.join(props.room);
            cb({ success: true })
        });

        // Todo: Bug to reproduce: 
        //  create three clients and look into the logs.
        //  Only one promise will have an ArrayBuffer, 
        //  the others will have "Buffer[]" which is not valid.

        // https://stackoverflow.com/questions/77675587/socket-io-promise-all-unexpected-results

        socket.on('hh:broadcast', async (props, cb) => {
            const session = sockets.get(socket);
            if (!session) return;
            const [room, that] = session;
            const collaborators = sessions.get(room)!;

            Promise.all<ArrayElement<NonNullable<Parameters<typeof cb>['0']>>>(collaborators
                .filter(([, other]) => other !== that)
                .map(([sock, other]) => sock
                    .emitWithAck('hh:data', { id: that, ...props })
                    .then(res => {
                        log.info("received", res);
                        return { id: other, data: copyArrayBuffer(res!.data) };
                    })
                    .catch(error => {
                        log.error("Promise rejected for", other, error);
                        // return a default value or handle the error as needed
                        return { id: other, error: "An error occurred" };
                    }))
            ).then(res => {
                log.warn("Promise.all:", res)
                console.log(res);
                
                cb(res);
            });
        })

        socket.on('hh:request', (props, cb) => {
            const session = sockets.get(socket);
            if (!session) return;
            const [room, id] = session;
            let collaborators = sessions.get(room)!;
            let host = collaborators[0][0];
            if (!host) return cb({ data: null });
            host.emit('hh:data', { id: id, ...props }, (res) => {
                if (res) cb({ data: res.data });
            });
        })

        socket.on('disconnect', () => {
            const session = sockets.get(socket);
            if (!session) return;
            const [room, id] = session;
            log.info("[disconnect]", id);
            socket.broadcast.to(room).emit('hh:user-disconnected', { id: id });
            const collaborators = sessions.get(room);
            if (!collaborators) return;
            const index = collaborators.findIndex(([_, _id]) => _id === id);
            if (index === -1) return;
            collaborators.splice(index, 1);
            tryRemoveSession(room);
        })
    });
}