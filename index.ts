import createLogger from 'logging';
import * as webserver from "./src/webserver/index";
import * as websocket from "./src/websocket/index";
import config from "./src/dotenv";

const log = createLogger('Main');

log.info(`Starting in ${config.env} mode`);

{
  const server = webserver.setup();
  const port = config.webserverPort;
  server.listen(parseInt(port!), "0.0.0.0", () => {
    log.info(`WebServer is 🔥 at http://localhost:${port}`);
  });
}
{
  const port = config.websocketPort;
  const uws = websocket.setup();
  uws.listen(parseInt(port!), () => {
    log.info(`WebSocket is 🔥 at http://localhost:${port}`);
  });
}