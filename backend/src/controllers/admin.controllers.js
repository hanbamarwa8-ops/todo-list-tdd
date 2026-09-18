import { getDB } from "../db/connection.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "users";

// GET ALL USERS
// ADMIN ONLY

export async function getUsers(req, res) {
  try {
    const db = getDB();

    const users = await db
      .collection(COLLECTION_NAME)
      .find({})
      .project({
        password: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0,
      })
      .toArray();

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        users,
      })
    );
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);

    res.writeHead(500, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        message: "Erreur serveur",
      })
    );
  }
}

// CHANGE USER ROLE
// ADMIN ONLY

export async function changeUserRole(req, res, userId) {
  try {
    if (!ObjectId.isValid(userId)) {
      res.writeHead(400, {
        "Content-Type": "application/json",
      });

      return res.end(
        JSON.stringify({
          message: "ID utilisateur invalide",
        })
      );
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { role } = JSON.parse(body);

        // Vérifier le rôle
        if (role !== "USER" && role !== "ADMIN") {
          res.writeHead(400, {
            "Content-Type": "application/json",
          });

          return res.end(
            JSON.stringify({
              message: "Rôle invalide",
            })
          );
        }

        const db = getDB();

        // MODIFIER LE RÔLE

        const result = await db.collection(COLLECTION_NAME).updateOne(
          {
            _id: new ObjectId(userId),
          },
          {
            $set: {
              role,
            },
          }
        );

        // Utilisateur introuvable
        if (result.matchedCount === 0) {
          res.writeHead(404, {
            "Content-Type": "application/json",
          });

          return res.end(
            JSON.stringify({
              message: "Utilisateur introuvable",
            })
          );
        }

        // RÉCUPÉRER L'UTILISATEUR MODIFIÉ

        const updatedUser = await db.collection(COLLECTION_NAME).findOne(
          {
            _id: new ObjectId(userId),
          },
          {
            projection: {
              password: 0,
              resetPasswordToken: 0,
              resetPasswordExpires: 0,
            },
          }
        );

        // RÉPONSE

        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            message: "Rôle modifié avec succès",

            user: {
              id: updatedUser._id.toString(),
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
            },
          })
        );
      } catch (error) {
        console.error("Erreur modification rôle :", error);

        res.writeHead(400, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            message: "Body JSON invalide",
          })
        );
      }
    });
  } catch (error) {
    console.error("Erreur changement rôle :", error);

    res.writeHead(500, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        message: "Erreur serveur",
      })
    );
  }
}
