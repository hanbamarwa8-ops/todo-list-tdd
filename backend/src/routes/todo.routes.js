import {getTodos,getTodo,addTodo,editTodo,removeTodo} from "../controllers/todo.controllers.js";
import {signup, login,logout,me,forgotPassword,resetPassword} from "../controllers/auth.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const ALLOWED_ORIGIN =
  process.env.FRONTEND_URL || "http://localhost:3000";

export function router(req, res) {
  const { method, url } = req;

  
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  
  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  //-->ROUTES AUTHENTIFICATION

  if (url === "/api/auth/signup" && method === "POST") {
    return signup(req, res);
  }

  if (url === "/api/auth/login" && method === "POST") {
    return login(req, res);
  }

  if (url === "/api/auth/logout" && method === "POST") {
    return logout(req, res);
  }

  if (url === "/api/auth/me" && method === "GET") {
    return me(req, res);
  }

  if (url === "/api/auth/forgot-password" && method === "POST") {
    return forgotPassword(req, res);
  }

  
  const resetMatch = url.match(/^\/api\/auth\/reset-password\/([a-f0-9]{64})$/);

  if (resetMatch && method === "POST") {
    return resetPassword(req, res, resetMatch[1]);
  }

  //--> AUTHENTIFICATION TODO


  const userId = authenticate(req, res);
  if (!userId) {
    return;}

  
  //->ROUTES TODOS

  // GET all
  if (url === "/api/todos" && method === "GET") {
    return getTodos(req, res, userId);
  }

  // POST todos connected user
  if (url === "/api/todos" && method === "POST") {
    return addTodo(req, res, userId);
  }

  // Routes avec un ID
  const match = url.match(
    /^\/api\/todos\/([a-fA-F0-9]{24})$/);

  if (match) {
    const id = match[1];

   
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

  // ROUTE introuvable 
  res.writeHead(404, {
    "Content-Type": "application/json"});

  res.end(
    JSON.stringify({message: "Route non trouvée"})
  );
}