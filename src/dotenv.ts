import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default {
    env: process.env.NODE_ENV,
    clientOrigin: process.env.CLIENT_ORIGIN,
    webserverPort: process.env.WEBSERVER_PORT,
    websocketPort: process.env.WEBSOCKET_PORT,
}