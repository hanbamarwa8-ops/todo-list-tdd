import {
  getTodos,
  getTodo,
  addTodo,
  editTodo,
  removeTodo
} from "../controllers/todo.controllers.js";

import {
  signup,
  login,
  logout,
  me,
  refresh,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controllers.js";

import {
  getUsers,
  changeUserRole
} from "../controllers/admin.controllers.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export async function router(req, res) {
  const { method, url } = req;


  // CORS

  const allowedOrigin =
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

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

  // SIGNUP
  if (
    method === "POST" &&
    url === "/api/auth/signup"
  ) {
    return signup(req, res);
  }

  // LOGIN
  if (
    method === "POST" &&
    url === "/api/auth/login"
  ) {
    return login(req, res);
  }

  // LOGOUT
  if (
    method === "POST" &&
    url === "/api/auth/logout"
  ) {
    return logout(req, res);
  }

  // ME
  if (
    method === "GET" &&
    url === "/api/auth/me"
  ) {
    return me(req, res);
  }

  // REFRESH TOKEN
  if (
    method === "POST" &&
    url === "/api/auth/refresh"
  ) {
    return refresh(req, res);
  }

  // FORGOT PASSWORD
  if (
    method === "POST" &&
    url === "/api/auth/forgot-password"
  ) {
    return forgotPassword(req, res);
  }

  // RESET PASSWORD
  if (
    method === "POST" &&
    url.startsWith(
      "/api/auth/reset-password/"
    )
  ) {
    const token = url.split("/").pop();

    return resetPassword(
      req,
      res,
      token
    );
  }

  // ADMIN - GET ALL USERS
  // ADMIN ONLY

  if (
    method === "GET" &&
    url === "/api/admin/users"
  ) {
    const user =
      await authenticate(req, res);

    if (!user) {
      return;
    }

    const isAuthorized =
      authorize("ADMIN")(
        user,
        res
      );

    if (!isAuthorized) {
      return;
    }

    return getUsers(req, res);
  }

  // ADMIN - CHANGE USER ROLE
  // ADMIN ONLY

  const roleMatch = url.match(
    /^\/api\/admin\/users\/([a-fA-F0-9]{24})\/role$/
  );

  if (
    method === "PUT" &&
    roleMatch
  ) {
    const user =
      await authenticate(req, res);

    if (!user) {
      return;
    }

    const isAuthorized =
      authorize("ADMIN")(
        user,
        res
      );

    if (!isAuthorized) {
      return;
    }

    const userId =
      roleMatch[1];

    return changeUserRole(
      req,
      res,
      userId
    );
  }

  // TODOS - GET ALL
  // USER + ADMIN

  if (
    method === "GET" &&
    url === "/api/todos"
  ) {
    const user =
      await authenticate(req, res);

    if (!user) {
      return;
    }

    const userId =
      user._id.toString();

    return getTodos(
      req,
      res,
      userId
    );
  }

  // TODOS - CREATE
  // USER + ADMIN

  if (
    method === "POST" &&
    url === "/api/todos"
  ) {
    const user =
      await authenticate(req, res);

    if (!user) {
      return;
    }

    const userId =
      user._id.toString();

    return addTodo(
      req,
      res,
      userId
    );
  }

  // TODO BY ID
  // USER + ADMIN

  const todoMatch = url.match(
    /^\/api\/todos\/([a-fA-F0-9]{24})$/
  );

  if (todoMatch) {
    const id =
      todoMatch[1];

    const user =
      await authenticate(req, res);

    if (!user) {
      return;
    }

    const userId =
      user._id.toString();

    // GET TODO
    if (method === "GET") {
      return getTodo(
        req,
        res,
        id,
        userId
      );
    }

    // UPDATE TODO
    if (method === "PUT") {
      return editTodo(
        req,
        res,
        id,
        userId
      );
    }

    // DELETE TODO
    if (method === "DELETE") {
      return removeTodo(
        req,
        res,
        id,
        userId
      );
    }
  }

  // 404

  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(
    JSON.stringify({
      message: "Route non trouvée"
    })
  );
}