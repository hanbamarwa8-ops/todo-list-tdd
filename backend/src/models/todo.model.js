import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataPath = path.join(__dirname, "../data/todos.json");

async function readTodos() {
  const data = await fs.readFile(dataPath, "utf-8");

  return JSON.parse(data);
}


async function writeTodos(todos) {
  await fs.writeFile(
    dataPath,
    JSON.stringify(todos, null, 2)
  );
}

// Récupérer tous les todos
export async function getAllTodos() {
  return await readTodos();
}

// Récupérer un todo par son ID
export async function getTodoById(id) {
  const todos = await readTodos();

  const todo = todos.find(
    (todo) => todo.id === Number(id)
  );

  if (!todo) {
    return null;
  }

  return todo;
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

  const todos = await readTodos();

  const nextId =
    todos.length > 0
      ? Math.max(...todos.map((todo) => todo.id)) + 1
      : 1;

  const newTodo = {
    id: nextId,
    title: title.trim(),
    completed: false
  };

  todos.push(newTodo);

  await writeTodos(todos);

  return newTodo;
}

// Modifier un todo
export async function updateTodo(id, updates) {
  const todos = await readTodos();

  const index = todos.findIndex(
    (todo) => todo.id === Number(id)
  );

  if (index === -1) {
    return null;
  }

  const { title, completed } = updates;

  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      throw new Error("Le titre est invalide");
    }

    todos[index].title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      throw new Error(
        "completed doit être un booléen"
      );
    }

    todos[index].completed = completed;
  }

  await writeTodos(todos);

  return todos[index];
}

// Supprimer un todo
export async function deleteTodo(id) {
  const todos = await readTodos();

  const index = todos.findIndex(
    (todo) => todo.id === Number(id)
  );

  if (index === -1) {
    return null;
  }

  const [deleted] = todos.splice(index, 1);

  await writeTodos(todos);

  return deleted;
}