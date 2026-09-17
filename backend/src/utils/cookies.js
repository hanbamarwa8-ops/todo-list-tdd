const isProduction = process.env.NODE_ENV === "production";

export function setCookie(res, name, value, options = {}) {
  const {
    httpOnly = true,
    secure = isProduction,
    sameSite = isProduction ? "None" : "Lax",
    maxAge,
    path = "/",
  } = options;

  let cookie = `${name}=${encodeURIComponent(value)}; Path=${path}`;

  if (httpOnly) {
    cookie += "; HttpOnly";
  }

  if (secure) {
    cookie += "; Secure";
  }

  if (sameSite) {
    cookie += `; SameSite=${sameSite}`;
  }

  if (maxAge !== undefined) {
    cookie += `; Max-Age=${maxAge}`;
  }

  res.setHeader("Set-Cookie", cookie);
}

export function clearCookie(res, name) {
  const isProduction = process.env.NODE_ENV === "production";

  const cookie =
    `${name}=; Path=/; Max-Age=0; HttpOnly` +
    (isProduction ? "; Secure; SameSite=None" : "; SameSite=Lax");

  res.setHeader("Set-Cookie", cookie);
}