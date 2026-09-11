import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const COLLECTION_NAME = "todos";

function toApiFormat(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    completed: doc.completed
  };
}

// Récupérer tous les todos
export async function getAllTodos() {
  const db = getDB();
  const todos = await db.collection(COLLECTION_NAME).find().toArray();
  return todos.map(toApiFormat);
}


// Récupérer un todo par son ID
export async function getTodoById(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = getDB();
  const todo = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

  return toApiFormat(todo);
}

// Créer un todo
export async function createTodo(title) {
  if (
    !title ||
    typeof title !== "string" ||
    !title.trim()
  ) {
    throw new Error("Le titre est requis");
  }

  const db = getDB();
  const newTodo = {
    title: title.trim(),
    completed: false
  };

  const result = await db.collection(COLLECTION_NAME).insertOne(newTodo);

  return toApiFormat({ _id: result.insertedId, ...newTodo });
}




// Modifier un todo
export async function updateTodo(id, updates) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const { title, completed } = updates;
  const setFields = {};

  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      throw new Error("Le titre est invalide");
    }
    setFields.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      throw new Error("completed doit être un booléen");
    }
    setFields.completed = completed;
  }

  const db = getDB();
  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: setFields },
    { returnDocument: "after" }
  );

  return toApiFormat(result);
}

// Supprimer un todo
export async function deleteTodo(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = getDB();
  const todo = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

  if (!todo) {
    return null;
  }

  await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

  return toApiFormat(todo);
}