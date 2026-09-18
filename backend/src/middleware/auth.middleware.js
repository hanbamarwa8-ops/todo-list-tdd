import { verifyAccessToken } from "../utils/jwt.js";
import { findUserById } from "../models/user.model.js";

export async function authenticate(req, res) {
  const cookies = req.headers.cookie;

  if (!cookies) {
    res.writeHead(401, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Vous devez être connecté"
      })
    );

    return null;
  }

  const tokenCookie = cookies
    .split(";")
    .find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );

  if (!tokenCookie) {
    res.writeHead(401, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Access token manquant"
      })
    );

    return null;
  }

  const token = tokenCookie
    .trim()
    .substring("accessToken=".length);

  try {
    const decoded = verifyAccessToken(token);

    const user = await findUserById(
      decoded.userId
    );

    if (!user) {
      res.writeHead(401, {
        "Content-Type": "application/json"
      });

      res.end(
        JSON.stringify({
          message: "Utilisateur introuvable"
        })
      );

      return null;
    }

    return user;

  } catch (error) {

    res.writeHead(401, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Access token invalide ou expiré"
      })
    );

    return null;
  }
}