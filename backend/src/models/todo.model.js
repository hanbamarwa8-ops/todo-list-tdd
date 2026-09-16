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

// GET
export async function getAllTodos(userId) {
  const db = getDB();

  const todos = await db
    .collection(COLLECTION_NAME)
    .find({ userId: new ObjectId(userId) })
    .toArray();

  return todos.map(toApiFormat);
}

// GET par ID
export async function getTodoById(id, userId) {
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return null;
  }

  const db = getDB();

  const todo = await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId)
  });

  return toApiFormat(todo);
}

// CREATION
export async function createTodo(title, userId) {
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("Le titre est requis");
  }

  if (!ObjectId.isValid(userId)) {
    throw new Error("Utilisateur invalide");
  }

  const db = getDB();

  const newTodo = {
    title: title.trim(),
    completed: false,
    userId: new ObjectId(userId)
  };

  const result = await db
    .collection(COLLECTION_NAME)
    .insertOne(newTodo);

  return toApiFormat({
    _id: result.insertedId,
    ...newTodo
  });
}

// UPDATE
export async function updateTodo(id, userId, updates) {
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return null;
  }

  const { title, completed } = updates;
  const setFields = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
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
    {
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    },
    {
      $set: setFields
    },
    {
      returnDocument: "after"
    }
  );

  return toApiFormat(result);
}

// DELETE
export async function deleteTodo(id, userId) {
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return null;
  }

  const db = getDB();

  const todo = await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId)
  });

  if (!todo) {
    return null;
  }

  await db.collection(COLLECTION_NAME).deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId)
  });

  return toApiFormat(todo);
}
