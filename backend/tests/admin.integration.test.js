import app from "../src/app.js";
import {
  connectDB,
  closeDB,
  getDB
} from "../src/db/connection.js";

import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../src/utils/jwt.js";

const ADMIN_EMAIL = "admin.integration@example.com";
const USER_EMAIL = "user.integration@example.com";
const PASSWORD = "TestPassword123";

let port;

let adminId;
let userId;

let adminCookie;
let userCookie;

beforeAll(async () => {
  await connectDB();

  const db = getDB();

  // Nettoyer les anciens utilisateurs de test
  await db.collection("users").deleteMany({
    email: {
      $in: [ADMIN_EMAIL, USER_EMAIL]
    }
  });

  const hashedPassword = await bcrypt.hash(
    PASSWORD,
    10
  );

  // Créer ADMIN
  const adminResult = await db.collection("users").insertOne({
    name: "Admin Test",
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "ADMIN",
    createdAt: new Date()
  });

  adminId = adminResult.insertedId.toString();

  // Créer USER
  const userResult = await db.collection("users").insertOne({
    name: "User Test",
    email: USER_EMAIL,
    password: hashedPassword,
    role: "USER",
    createdAt: new Date()
  });

  userId = userResult.insertedId.toString();

  // Token ADMIN
  const adminAccessToken = generateAccessToken({
    userId: adminId
  });

  adminCookie = `accessToken=${adminAccessToken}`;

  // Token USER
  const userAccessToken = generateAccessToken({
    userId: userId
  });

  userCookie = `accessToken=${userAccessToken}`;

  // Démarrer le serveur de test
  await new Promise((resolve) => {
    app.listen(0, () => {
      port = app.address().port;
      resolve();
    });
  });
});


afterAll(async () => {
  const db = getDB();

  // Supprimer les utilisateurs de test
  await db.collection("users").deleteMany({
    _id: {
      $in: [
        new ObjectId(adminId),
        new ObjectId(userId)
      ]
    }
  });

  await closeDB();

  await new Promise((resolve) => {
    app.close(resolve);
  });
});


describe("RBAC - Tests d'intégration", () => {

  // ADMIN - GET USERS

  test(
    "ADMIN - GET /api/admin/users - doit pouvoir voir les utilisateurs",
    async () => {

      const response = await fetch(
        `http://localhost:${port}/api/admin/users`,
        {
          method: "GET",

          headers: {
            "Cookie": adminCookie
          }
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.users)).toBe(true);
    }
  );


  // USER - GET USERS

  test(
    "USER - GET /api/admin/users - doit être refusé",
    async () => {

      const response = await fetch(
        `http://localhost:${port}/api/admin/users`,
        {
          method: "GET",

          headers: {
            "Cookie": userCookie
          }
        }
      );

      const data = await response.json();

      expect(response.status).toBe(403);

      expect(data.message).toBe(
        "Accès interdit : rôle insuffisant"
      );
    }
  );


  // ADMIN - CHANGE ROLE

  test(
    "ADMIN - PUT /api/admin/users/:id/role - doit pouvoir modifier un rôle",
    async () => {

      const response = await fetch(
        `http://localhost:${port}/api/admin/users/${userId}/role`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Cookie": adminCookie
          },

          body: JSON.stringify({
            role: "ADMIN"
          })
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);

      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(userId);
      expect(data.user.role).toBe("ADMIN");
    }
  );


  // USER - CHANGE ROLE

  test(
    "USER - PUT /api/admin/users/:id/role - doit être refusé",
    async () => {

      // Remettre le compte USER en USER
      const db = getDB();

      await db.collection("users").updateOne(
        {
          _id: new ObjectId(userId)
        },
        {
          $set: {
            role: "USER"
          }
        }
      );

      const response = await fetch(
        `http://localhost:${port}/api/admin/users/${userId}/role`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Cookie": userCookie
          },

          body: JSON.stringify({
            role: "ADMIN"
          })
        }
      );

      const data = await response.json();

      expect(response.status).toBe(403);

      expect(data.message).toBe(
        "Accès interdit : rôle insuffisant"
      );
    }
  );


  // INVALID ROLE

  test(
    "ADMIN - doit refuser un rôle invalide",
    async () => {

      const response = await fetch(
        `http://localhost:${port}/api/admin/users/${userId}/role`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Cookie": adminCookie
          },

          body: JSON.stringify({
            role: "SUPERADMIN"
          })
        }
      );

      const data = await response.json();

      expect(response.status).toBe(400);

      expect(data.message).toBe(
        "Rôle invalide"
      );
    }
  );


  // NON EXISTENT USER

  test(
    "ADMIN - doit retourner 404 pour un utilisateur inexistant",
    async () => {

      const nonExistentUserId =
        "507f1f77bcf86cd799439011";

      const response = await fetch(
        `http://localhost:${port}/api/admin/users/${nonExistentUserId}/role`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Cookie": adminCookie
          },

          body: JSON.stringify({
            role: "USER"
          })
        }
      );

      const data = await response.json();

      expect(response.status).toBe(404);

      expect(data.message).toBe(
        "Utilisateur introuvable"
      );
    }
  );


  // PASSWORD SECURITY

  test(
    "ADMIN - GET users - ne doit jamais retourner les mots de passe",
    async () => {

      const response = await fetch(
        `http://localhost:${port}/api/admin/users`,
        {
          method: "GET",

          headers: {
            "Cookie": adminCookie
          }
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);

      for (const user of data.users) {
        expect(user.password).toBeUndefined();
        expect(user.resetPasswordToken).toBeUndefined();
        expect(user.resetPasswordExpires).toBeUndefined();
      }
    }
  );

});