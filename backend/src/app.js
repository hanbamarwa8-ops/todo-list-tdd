import http from "http";
import { router } from "./routes/todo.routes.js";

const app = http.createServer(router);

export default app;