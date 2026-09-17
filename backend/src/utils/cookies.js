export function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(";").forEach((pair) => {
    const [
      key,
      ...valueParts
    ] = pair.trim().split("=");

    cookies[key] = decodeURIComponent(
      valueParts.join("=")
    );
  });

  return cookies;
}


// Créer un cookie
export function serializeCookie(
  name,
  value,
  options = {}
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`
  ];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(
      `SameSite=${options.sameSite}`
    );
  }

  return parts.join("; ");
}


// Créer les cookies
// Access Token + Refresh Token
export function setAuthCookies(
  res,
  accessToken,
  refreshToken
) {
  const isProduction =
    process.env.NODE_ENV === "production";

  const sameSite = isProduction
    ? "None"
    : "Lax";

  const secure = isProduction;

  const accessCookie =
    serializeCookie(
      "accessToken",
      accessToken,
      {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 900,
      }
    );

  const refreshCookie =
    serializeCookie(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 604800,
      }
    );

  res.setHeader("Set-Cookie", [
    accessCookie,
    refreshCookie,
  ]);
}


// Supprimer les cookies
export function clearAuthCookies(res) {
  const isProduction =
    process.env.NODE_ENV === "production";

  const sameSite = isProduction
    ? "None"
    : "Lax";

  const secure = isProduction;

  const accessCookie =
    serializeCookie(
      "accessToken",
      "",
      {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 0,
      }
    );

  const refreshCookie =
    serializeCookie(
      "refreshToken",
      "",
      {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 0,
      }
    );

  res.setHeader("Set-Cookie", [
    accessCookie,
    refreshCookie,
  ]);
}