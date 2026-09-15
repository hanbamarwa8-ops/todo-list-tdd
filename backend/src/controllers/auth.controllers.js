import {
    createUser,
    findUserByEmail,
    findUserById,
    verifyPassword,
    setResetToken,
    findUserByResetToken,
    updatePassword
} from "../models/user.model.js";
  import { generateToken, verifyToken } from "../utils/jwt.js";
  import { parseCookies, serializeCookie } from "../utils/cookies.js";
  import { sendResetEmail } from "../utils/email.js";
  
  function readBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          reject(new Error("Body JSON invalide"));
        }
      });
      req.on("error", reject);
    });
  }
  
  function setAuthCookie(res, token) {
    const cookie = serializeCookie("token", token, {
      httpOnly: true, // inaccessible en Js  navigateur
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7, 
      path: "/"
    });
  
    res.setHeader("Set-Cookie", cookie);
  }
  
  function clearAuthCookie(res) {
    const cookie = serializeCookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 0,
      path: "/"
    });
  
    res.setHeader("Set-Cookie", cookie);
  }
  
  export async function signup(req, res) {
    try {
      const body = await readBody(req);
      const { name, email, password } = body;
  
      if (!name || !email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Nom, email et mot de passe sont requis" }));
      }
  
      if (password.length < 8) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Le mot de passe doit faire au moins 8 caractères" }));
      }
  
      const user = await createUser({ name, email, password });
      const token = generateToken({ userId: user.id });
  
      setAuthCookie(res, token);
  
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user }));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: error.message }));
    }
  }
  
  export async function login(req, res) {
    try {
      const body = await readBody(req);
      const { email, password } = body;
  
      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Email et mot de passe sont requis" }));
      }
  
      const user = await findUserByEmail(email);
      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Email ou mot de passe incorrect" }));
      }
  
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Email ou mot de passe incorrect" }));
      }
  
      const token = generateToken({ userId: user._id.toString() });
      setAuthCookie(res, token);
  
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          user: { id: user._id.toString(), name: user.name, email: user.email }
        })
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Erreur lors de la connexion" }));
    }
  }
  
  export async function logout(req, res) {
    clearAuthCookie(res);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Déconnecté" }));
  }
  
  // Vérifie si l'utilisateur est connecté en faisant la lecture de cookie httpOnly
  export async function me(req, res) {
    try {
      const cookies = parseCookies(req);
      const token = cookies.token;
  
      if (!token) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Non authentifié" }));
      }
  
      const payload = verifyToken(token);
      const user = await findUserById(payload.userId);
  
      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Utilisateur introuvable" }));
      }
  
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          user: { id: user._id.toString(), name: user.name, email: user.email }
        })
      );
    } catch (error) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Session invalide ou expirée" }));
    }
  }
  
  // Partie mot de passe oublié
  
  export async function forgotPassword(req, res) {
    try {
      const body = await readBody(req);
      const { email } = body;
  
      if (!email) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Email requis" }));
      }
  
      const rawToken = await setResetToken(email);
  
     
      if (rawToken) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
        await sendResetEmail(email, resetLink);
      }
  
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Si ce compte existe, un email a été envoyé." }));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Erreur lors de l'envoi de l'email" }));
    }
  }
  
  export async function resetPassword(req, res, token) {
    try {
      const body = await readBody(req);
      const { password } = body;
  
      if (!password || password.length < 8) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "Le mot de passe doit faire au moins 8 caractères" })
        );
      }
  
      const user = await findUserByResetToken(token);
      if (!user) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Lien invalide ou expiré" }));
      }
  
      await updatePassword(user._id, password);
  
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Mot de passe mis à jour avec succès" }));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Erreur lors de la réinitialisation" }));
    }
  }