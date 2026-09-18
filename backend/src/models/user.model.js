import { getDB } from "../db/connection.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const COLLECTION_NAME = "users";

export async function findUserByEmail(email) {
  const db = getDB();

  return await db
    .collection(COLLECTION_NAME)
    .findOne({
      email: email.toLowerCase()
    });
}

export async function findUserById(id) {
  if (!ObjectId.isValid(id)) return null;

  const db = getDB();

  return await db
    .collection(COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    });
}

export async function createUser({ name, email, password }) {
  const db = getDB();

  const existing = await findUserByEmail(email);

  if (existing) {
    throw new Error("Un compte existe déjà avec cet email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: "USER",
    createdAt: new Date()
  };

  const result = await db
    .collection(COLLECTION_NAME)
    .insertOne(newUser);

    return {
      id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
}

export async function verifyPassword(
  plainPassword,
  hashedPassword
) {
  return await bcrypt.compare(
    plainPassword,
    hashedPassword
  );
}

// MOT DE PASSE OUBLIÉ

export async function setResetToken(email) {
  const db = getDB();

  const user = await findUserByEmail(email);

  if (!user) return null;

  const rawToken = crypto
    .randomBytes(32)
    .toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expires = new Date(
    Date.now() + 60 * 60 * 1000
  );

  await db
    .collection(COLLECTION_NAME)
    .updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expires
        }
      }
    );

  return rawToken;
}

export async function findUserByResetToken(rawToken) {
  const db = getDB();

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return await db
    .collection(COLLECTION_NAME)
    .findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date()
      }
    });
}

export async function updatePassword(
  userId,
  newPassword
) {
  const db = getDB();

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  await db
    .collection(COLLECTION_NAME)
    .updateOne(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: {
          password: hashedPassword
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: ""
        }
      }
    );
}