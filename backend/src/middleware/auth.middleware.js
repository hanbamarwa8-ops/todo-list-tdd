import { verifyToken } from "../utils/jwt.js";


export function authenticate(req, res) {
  const cookies = req.headers.cookie;

  if (!cookies) {
    res.writeHead(401, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      message: "Vous devez être connecté"
    }));

    return null;
  }

  const tokenCookie = cookies
    .split(";")
    .find(cookie => cookie.trim().startsWith("token="));

  if (!tokenCookie) {
    res.writeHead(401, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      message: "Vous devez être connecté"
    }));

    return null;
  }

  const token = tokenCookie.split("=")[1];

  try {
    const decoded = verifyToken(token);

    return decoded.userId;

  } catch (error) {
    res.writeHead(401, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      message: "Session invalide ou expirée"
    }));

    return null;
  }
}

