import { connectDB } from "../src/db/connection.js";
import { router } from "../src/routes/todo.routes.js";

let dbConnected = false;

export default async function handler(req, res) {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
      console.log("Connecté à MongoDB Atlas");
    }

    return router(req, res);
  } catch (error) {
    console.error("Erreur :", error);

    res.writeHead(500, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Erreur serveur",
        error: error.message
      })
    );
  }
}