import { connectDB } from "../src/db/connection.js";
import app from "../src/app.js";

let dbPromise;

export default async function handler(req, res) {
  try {
    if (!dbPromise) {
      dbPromise = connectDB();
    }

    await dbPromise;

    return app(req, res);
  } catch (error) {
    console.error("Erreur API Vercel :", error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "Erreur serveur",
        })
      );
    }
  }
}