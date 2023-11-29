import dotenv from 'dotenv';
import createLogger from 'logging';
import * as webserver from "./src/webserver/index";
import * as websocket from "./src/websocket/index";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const log = createLogger('Main');

{
  const server = webserver.setup();
  const port = process.env.WEBSERVER_PORT;
  server.listen(parseInt(port!), "0.0.0.0", () => {
    log.info(`WebServer is 🔥 at http://localhost:${port}`);
  });
}
{
  const port = process.env.WEBSOCKET_PORT;
  const uws = websocket.setup();
  uws.listen(parseInt(port!), () => {
    log.info(`WebSocket is 🔥 at http://localhost:${port}`);
  });
}