import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("La variable MONGODB_URI est manquante dans le fichier .env");
}

const client = new MongoClient(uri);

let db;

export async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db(); 
    console.log("Connecté à MongoDB Atlas");
    return db;
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error);
    throw error;
  }
}

export async function closeDB() {
  await client.close();
}

export function getDB() {
  if (!db) {
    throw new Error("La base de données n'est pas encore connectée. Appelle connectDB() d'abord.");
  }
  return db;
}