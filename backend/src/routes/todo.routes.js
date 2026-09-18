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

  // CORS

  const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:3000";

  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigin
  );

  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true"
  );

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

  // AUTH

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

  if (
    method === "POST" &&
    url === "/api/auth/forgot-password"
  ) {
    return forgotPassword(req, res);
  }

  if (
    method === "POST" &&
    url.startsWith("/api/auth/reset-password/")
  ) {
    const token = url.split("/").pop();
    return resetPassword(req, res, token);
  }

  // TODOS

  if (method === "GET" && url === "/api/todos") {
    const userId = authenticate(req, res);

    if (!userId) {
      return;
    }

    return getTodos(req, res, userId);
  }

  if (method === "POST" && url === "/api/todos") {
    const userId = authenticate(req, res);

    if (!userId) {
      return;
    }

    return addTodo(req, res, userId);
  }

  const todoMatch = url.match(
    /^\/api\/todos\/([a-fA-F0-9]{24})$/
  );

  if (todoMatch) {
    const id = todoMatch[1];

    const userId = authenticate(req, res);

    if (!userId) {
      return;
    }

    if (method === "GET") {
      return getTodo(req, res, id, userId);
    }

    if (method === "PUT") {
      return editTodo(req, res, id, userId);
    }

    if (method === "DELETE") {
      return removeTodo(req, res, id, userId);
    }
  }

  // 404

  res.writeHead(404, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      message: "Route non trouvée",
    })
  );
}