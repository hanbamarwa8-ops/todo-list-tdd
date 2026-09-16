import {getAllTodos,getTodoById,createTodo,updateTodo,deleteTodo} from "../models/todo.model.js";

// GET
// Récupérer les tâches du user connecté
export async function getTodos(req, res, userId) {
  try {
    const todos = await getAllTodos(userId);

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(todos));

  } catch (error) {
    console.error(error);

    res.writeHead(500, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Erreur lors de la récupération des todos"
      })
    );
  }
}


// GET
export async function getTodo(req, res, id, userId) {
  try {
    const todo = await getTodoById(id, userId);

    if (!todo) {
      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      return res.end(
        JSON.stringify({
          message: "Todo non trouvé"
        })
      );
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(todo));

  } catch (error) {
    console.error(error);

    res.writeHead(500, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Erreur lors de la récupération du todo"
      })
    );
  }
}


// POST
export async function addTodo(req, res, userId) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      let parsed;

      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(
          JSON.stringify({
            message: "Body JSON invalide"
          })
        );
      }

      const { title } = parsed;

      if (
        !title ||
        typeof title !== "string" ||
        !title.trim()
      ) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(
          JSON.stringify({
            message: "Le titre est requis"
          })
        );
      }

      const todo = await createTodo(title, userId);

      res.writeHead(201, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(todo));

    } catch (error) {
      console.error(error);

      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(
        JSON.stringify({
          message: "Erreur lors de la création du todo"
        })
      );
    }
  });
}


// PUT
export async function editTodo(req, res, id, userId) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      let updates;

      try {
        updates = JSON.parse(body);
      } catch {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(
          JSON.stringify({
            message: "Body JSON invalide"
          })
        );
      }

      if (
        typeof updates !== "object" ||
        updates === null ||
        Array.isArray(updates)
      ) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(
          JSON.stringify({
            message: "Les données sont invalides"
          })
        );
      }

      const allowedUpdates = {};

      if (updates.title !== undefined) {
        if (
          typeof updates.title !== "string" ||
          !updates.title.trim()
        ) {
          res.writeHead(400, {
            "Content-Type": "application/json"
          });

          return res.end(
            JSON.stringify({
              message: "Le titre est invalide"
            })
          );
        }

        allowedUpdates.title = updates.title.trim();
      }

      if (updates.completed !== undefined) {
        if (typeof updates.completed !== "boolean") {
          res.writeHead(400, {
            "Content-Type": "application/json"
          });

          return res.end(
            JSON.stringify({
              message: "completed doit être un booléen"
            })
          );
        }

        allowedUpdates.completed = updates.completed;
      }

      if (Object.keys(allowedUpdates).length === 0) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        return res.end(
          JSON.stringify({
            message: "Aucune donnée valide à modifier"
          })
        );
      }

    
      const updated = await updateTodo(
        id,
        userId,
        allowedUpdates
      );

      if (!updated) {
        res.writeHead(404, {
          "Content-Type": "application/json"
        });

        return res.end(
          JSON.stringify({
            message: "Todo non trouvé"
          })
        );
      }

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(updated));

    } catch (error) {
      console.error(error);

      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(
        JSON.stringify({
          message: "Erreur lors de la modification du todo"
        })
      );
    }
  });
}


// DELETE
export async function removeTodo(req, res, id, userId) {
  try {
    const deleted = await deleteTodo(id, userId);

    if (!deleted) {
      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      return res.end(
        JSON.stringify({
          message: "Todo non trouvé"
        })
      );
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Todo supprimé",
        todo: deleted
      })
    );

  } catch (error) {
    console.error(error);

    res.writeHead(500, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Erreur lors de la suppression du todo"
      })
    );
  }
}