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

  return cookie;
}

export function parseCookies(req) {
  const cookies = {};

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (!name) {
      return;
    }

    const value = valueParts.join("=");

    cookies[name] = decodeURIComponent(value);
  });

  return cookies;
}

export function setAuthCookies(
  res,
  accessToken,
  refreshToken
) {
  const accessCookie = setCookie(
    res,
    "accessToken",
    accessToken,
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 15 * 60,
      path: "/",
    }
  );

  const refreshCookie = setCookie(
    res,
    "refreshToken",
    refreshToken,
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    }
  );

  res.setHeader("Set-Cookie", [
    accessCookie,
    refreshCookie,
  ]);
}

export function clearAuthCookies(res) {
  const accessCookie = setCookie(
    res,
    "accessToken",
    "",
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 0,
      path: "/",
    }
  );

  const refreshCookie = setCookie(
    res,
    "refreshToken",
    "",
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 0,
      path: "/",
    }
  );

  res.setHeader("Set-Cookie", [
    accessCookie,
    refreshCookie,
  ]);
}