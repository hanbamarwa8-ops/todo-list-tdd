import {
  getTodos,
  getTodo,
  addTodo,
  editTodo,
  removeTodo,
} from "../controllers/todo.controllers.js";

import {
  signup,
  login,
  logout,
  me,
  refresh,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controllers.js";

import { authenticate } from "../middleware/auth.middleware.js";

export function router(req, res) {
  const { method, url } = req;

  const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:3000";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  //->AUTH

  if (method === "POST" && url === "/api/auth/signup") {
    return signup(req, res);
  }

  if (method === "POST" && url === "/api/auth/login") {
    return login(req, res);
  }

  if (method === "POST" && url === "/api/auth/logout") {
    return logout(req, res);
  }

  if (method === "GET" && url === "/api/auth/me") {
    return me(req, res);
  }

  if (method === "POST" && url === "/api/auth/refresh") {
    return refresh(req, res);
  }

  if (method === "POST" && url === "/api/auth/forgot-password") {
    return forgotPassword(req, res);
  }

  // reset-password contient le token dans l'URL
  if (
    method === "POST" &&
    url.startsWith("/api/auth/reset-password/")
  ) {
    return resetPassword(req, res);
  }

  //->TODOS

  if (method === "GET" && url === "/api/todos") {
    return authenticate(req, res, () => getTodos(req, res));
  }

  if (method === "POST" && url === "/api/todos") {
    return authenticate(req, res, () => addTodo(req, res));
  }

  const todoMatch = url.match(/^\/api\/todos\/([a-fA-F0-9]{24})$/);

  if (todoMatch) {
    const id = todoMatch[1];

    if (method === "GET") {
      return authenticate(req, res, () => getTodo(req, res, id));
    }

    if (method === "PUT") {
      return authenticate(req, res, () => editTodo(req, res, id));
    }

    if (method === "DELETE") {
      return authenticate(req, res, () => removeTodo(req, res, id));
    }
  }

  res.writeHead(404, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      message: "Route non trouvée",
    })
  );
}