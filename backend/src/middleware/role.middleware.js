export function authorize(...allowedRoles) {
  return (user, res) => {

    if (!user) {
      return false;
    }

    if (!allowedRoles.includes(user.role)) {

      res.writeHead(403, {
        "Content-Type": "application/json"
      });

      res.end(
        JSON.stringify({
          message: "Accès interdit : rôle insuffisant"
        })
      );

      return false;
    }

    return true;
  };
}