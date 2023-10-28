
import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from "socket.io";
import { App as MicroWebSockets } from "uWebSockets.js";

dotenv.config();

const app: Application = express();

const server = http.createServer(app);
const io = new Server(server, {
  transports: ["websocket", "polling"],
  cors: {
    allowedHeaders: ["Content-Type", "Authorization"],
    origin: "http://localhost:5173/", // TODO: change to harmonyhub.com
    credentials: true,
  }
});

const uws = MicroWebSockets();
io.attachApp(uws);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

io.on("connection", (socket) => {
  console.log("a user connected");
  
  // send a message to the client
  socket.broadcast.emit("hello", "world");

  // receive a message from the client 
  socket.on("howdy", (arg) => {
    console.log(arg); // prints "stranger" 
  });
});

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server is 🔥 at http://localhost:${port}`);
});