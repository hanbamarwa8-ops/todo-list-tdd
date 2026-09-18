import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  setResetToken,
  findUserByResetToken,
  updatePassword
} from "../models/user.model.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from "../utils/jwt.js";

import {
  parseCookies,
  setAuthCookies,
  clearAuthCookies
} from "../utils/cookies.js";

import { sendResetEmail } from "../utils/email.js";



function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(
          body
            ? JSON.parse(body)
            : {}
        );
      } catch {
        reject(
          new Error("Body JSON invalide")
        );
      }
    });

    req.on("error", reject);
  });
}


// SIGNUP

export async function signup(req, res) {
  try {
    const body =
      await readBody(req);

    const {
      name,
      email,
      password
    } = body;

    if (
      !name ||
      !email ||
      !password
    ) {
      res.writeHead(400, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Nom, email et mot de passe sont requis"
        })
      );
    }

    if (password.length < 8) {
      res.writeHead(400, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Le mot de passe doit faire au moins 8 caractères"
        })
      );
    }

    // createUser attribue automatiquement USER
    const user =
      await createUser({
        name,
        email,
        password
      });

    const accessToken =
      generateAccessToken({
        userId: user.id
      });

    const refreshToken =
      generateRefreshToken({
        userId: user.id
      });

   
    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );

    res.writeHead(201, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        user
      })
    );

  } catch (error) {
    console.error(error);

    res.writeHead(400, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          error.message
      })
    );
  }
}


// LOGIN

export async function login(req, res) {
  try {
    const body =
      await readBody(req);

    const {
      email,
      password
    } = body;

    if (
      !email ||
      !password
    ) {
      res.writeHead(400, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Email et mot de passe sont requis"
        })
      );
    }

    const user =
      await findUserByEmail(email);

    if (!user) {
      res.writeHead(401, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Email ou mot de passe incorrect"
        })
      );
    }

    const isValid =
      await verifyPassword(
        password,
        user.password
      );

    if (!isValid) {
      res.writeHead(401, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Email ou mot de passe incorrect"
        })
      );
    }

    const accessToken =
      generateAccessToken({
        userId:
          user._id.toString()
      });

    const refreshToken =
      generateRefreshToken({
        userId:
          user._id.toString()
      });

    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );

    res.writeHead(200, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        user: {
          id:
            user._id.toString(),

          name:
            user.name,

          email:
            user.email,

          role:
            user.role || "USER"
        }
      })
    );

  } catch (error) {
    console.error(error);

    res.writeHead(500, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          "Erreur lors de la connexion"
      })
    );
  }
}


export async function refresh(req, res) {
  try {
    const cookies =
      parseCookies(req);

    const refreshToken =
      cookies.refreshToken;

    if (!refreshToken) {
      res.writeHead(401, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Refresh token manquant"
        })
      );
    }

    const payload =
      verifyRefreshToken(
        refreshToken
      );

    const user =
      await findUserById(
        payload.userId
      );

    if (!user) {
      res.writeHead(401, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Utilisateur introuvable"
        })
      );
    }

    const newAccessToken =
      generateAccessToken({
        userId:
          payload.userId
      });

    const isProduction =
      process.env.NODE_ENV ===
      "production";

    const accessCookie =
      `accessToken=${encodeURIComponent(
        newAccessToken
      )}; ` +
      `Max-Age=900; ` +
      `Path=/; ` +
      `HttpOnly; ` +
      `${
        isProduction
          ? "Secure; "
          : ""
      }` +
      `SameSite=${
        isProduction
          ? "None"
          : "Lax"
      }`;

    res.writeHead(200, {
      "Content-Type":
        "application/json",

      "Set-Cookie":
        accessCookie
    });

    res.end(
      JSON.stringify({
        message:
          "Access token renouvelé"
      })
    );

  } catch (error) {
    console.error(error);

    res.writeHead(401, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          "Refresh token invalide ou expiré"
      })
    );
  }
}


// LOGOUT

export async function logout(req, res) {
  clearAuthCookies(res);

  res.writeHead(200, {
    "Content-Type":
      "application/json"
  });

  res.end(
    JSON.stringify({
      message:
        "Déconnecté"
    })
  );
}


// ME

export async function me(req, res) {
  try {
    const cookies =
      parseCookies(req);

    const accessToken =
      cookies.accessToken;

    if (!accessToken) {
      res.writeHead(401, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Non authentifié"
        })
      );
    }

    const payload =
      verifyAccessToken(
        accessToken
      );

    const user =
      await findUserById(
        payload.userId
      );

    if (!user) {
      res.writeHead(401, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Utilisateur introuvable"
        })
      );
    }

    res.writeHead(200, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        user: {
          id:
            user._id.toString(),

          name:
            user.name,

          email:
            user.email,

          role:
            user.role || "USER"
        }
      })
    );

  } catch (error) {
    res.writeHead(401, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          "Access token invalide ou expiré"
      })
    );
  }
}


// FORGOT PASSWORD

export async function forgotPassword(
  req,
  res
) {
  try {
    const body =
      await readBody(req);

    const { email } = body;

    if (!email) {
      res.writeHead(400, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Email requis"
        })
      );
    }

    const rawToken =
      await setResetToken(
        email
      );

    if (rawToken) {
      const resetLink =
        `${process.env.FRONTEND_URL}` +
        `/reset-password/${rawToken}`;

      await sendResetEmail(
        email,
        resetLink
      );
    }

    res.writeHead(200, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          "Si ce compte existe, un email a été envoyé."
      })
    );

  } catch (error) {
    console.error(error);

    res.writeHead(500, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          "Erreur lors de l'envoi de l'email"
      })
    );
  }
}


// RESET PASSWORD

export async function resetPassword(
  req,
  res,
  token
) {
  try {
    const body =
      await readBody(req);

    const { password } = body;

    if (
      !password ||
      password.length < 8
    ) {
      res.writeHead(400, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Le mot de passe doit faire au moins 8 caractères"
        })
      );
    }

    const user =
      await findUserByResetToken(
        token
      );

    if (!user) {
      res.writeHead(400, {
        "Content-Type":
          "application/json"
      });

      return res.end(
        JSON.stringify({
          message:
            "Lien invalide ou expiré"
        })
      );
    }

    await updatePassword(
      user._id,
      password
    );

    res.writeHead(200, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          "Mot de passe mis à jour avec succès"
      })
    );

  } catch (error) {
    console.error(error);

    res.writeHead(500, {
      "Content-Type":
        "application/json"
    });

    res.end(
      JSON.stringify({
        message:
          "Erreur lors de la réinitialisation"
      })
    );
  }
}