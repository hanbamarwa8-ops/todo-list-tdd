import { router } from "../src/routes/todo.routes.js";
import { connectDB } from "../src/db/connection.js";

let dbConnection;

export default async function handler(req, res) {
  if (!dbConnection) {
    dbConnection = connectDB();
  }
  await dbConnection;

  return router(req, res);
}