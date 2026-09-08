import {getTodos,getTodo,addTodo,editTodo,removeTodo} from "../controllers/todo.controllers.js";

export function router(req, res) {
  const { method, url } = req;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (url === "/api/todos" && method === "GET") {
    return getTodos(req, res);
  }

  if (url === "/api/todos" && method === "POST") {
    return addTodo(req, res);
  }

  const match = url.match(/^\/api\/todos\/(\d+)$/);

  if (match) {
    const id = match[1];

    if (method === "GET") {
      return getTodo(req, res, id);
    }

    if (method === "PUT") {
      return editTodo(req, res, id);
    }

    if (method === "DELETE") {
      return removeTodo(req, res, id);
    }
  }

  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(
    JSON.stringify({
      message: "Route non trouvée"
    })
  );
}