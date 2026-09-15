export function parseCookies(req) {
    const cookieHeader = req.headers.cookie;
    const cookies = {};
  
    if (!cookieHeader) return cookies;
  
    cookieHeader.split(";").forEach((pair) => {
      const [key, ...valueParts] = pair.trim().split("=");
      cookies[key] = decodeURIComponent(valueParts.join("="));
    });
  
    return cookies;
  }
  
 
  export function serializeCookie(name, value, options = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`];
  
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
      parts.push(`SameSite=${options.sameSite}`);
    }
  
    return parts.join("; ");
  }
  //-->Lecture des cookies envoyés par le navigateur 