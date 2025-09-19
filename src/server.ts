import path from "path";
import express from "express";
import routes from "./routes/index";
import swaggerUi from "swagger-ui-express";
import swaggerJson from "./swagger.json";
//import { swaggerOptions } from "./swaggerOptions";
import { SafeWebSocketServer, setupWebSocket } from "./websocket";
import { fileURLToPath } from "url";
import { wordSet } from "./Classes/services/Words";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;

const app = express();

let _wss: SafeWebSocketServer | null = null;

const url = "0.0.0.0";
export const server = app.listen(port, url, () => {
  _wss = setupWebSocket(server);
  console.log(`Server running on ${url}:${port}`);
});

console.log(wordSet.size);
export function getOrCreateWSS(): SafeWebSocketServer {
  if (_wss) return _wss;
  _wss = setupWebSocket(server);
  return _wss;
}

app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

app.use("/api", routes);

app.use("/", express.static(path.join(__dirname, "public", "frontend")));

export default app;
