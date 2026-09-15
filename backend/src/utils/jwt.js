import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export function generateAccessToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas défini dans le fichier .env");
  }

  return jwt.sign(
    {...payload,type: "access"
    },
    JWT_SECRET,
    {expiresIn: ACCESS_TOKEN_EXPIRES_IN ="30s"}
  );
}

export function generateRefreshToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas défini dans le fichier .env");
  }

  return jwt.sign(
    {...payload,
      type: "refresh"},
    JWT_SECRET,
    {expiresIn: REFRESH_TOKEN_EXPIRES_IN}
  );
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded.type !== "access") {
    throw new Error("Token invalide");
  }

  return decoded;
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded.type !== "refresh") {
    throw new Error("Refresh token invalide");
  }

  return decoded;
}