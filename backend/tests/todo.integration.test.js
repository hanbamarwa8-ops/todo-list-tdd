import app from "../src/app.js";
import { connectDB, closeDB, getDB } from "../src/db/connection.js";
import { ObjectId } from "mongodb";

const NON_EXISTENT_ID = "507f1f77bcf86cd799439011";

let port;
let createdIds = [];

beforeAll(async () => {
  await connectDB();

  await new Promise((resolve) => {
    app.listen(0, () => {
      port = app.address().port;
      resolve();
    });
  });
});

afterEach(async () => {
  if (createdIds.length > 0) {
    const db = getDB();
    await db.collection("todos").deleteMany({
      _id: { $in: createdIds.map((id) => new ObjectId(id)) }
    });
    createdIds = [];
  }
});

afterAll(async () => {
  await closeDB();

  await new Promise((resolve) => {
    app.close(resolve);
  });
});

describe("Todo API - Tests d'intégration", () => {

  test("POST /api/todos - doit créer un nouveau todo", async () => {
    const response = await fetch(`http://localhost:${port}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Apprendre les tests d'intégration" })
    });

    const data = await response.json();
    createdIds.push(data.id);

    expect(response.status).toBe(201);
    expect(data.id).toEqual(expect.any(String));
    expect(data.title).toBe("Apprendre les tests d'intégration");
    expect(data.completed).toBe(false);
  });

  test("GET /api/todos - doit récupérer tous les todos", async () => {
    const response = await fetch(`http://localhost:${port}/api/todos`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/todos/:id - doit récupérer un todo par son ID", async () => {
    const createResponse = await fetch(`http://localhost:${port}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Todo à récupérer" })
    });

    const createdTodo = await createResponse.json();
    createdIds.push(createdTodo.id);

    const response = await fetch(`http://localhost:${port}/api/todos/${createdTodo.id}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdTodo.id);
    expect(data.title).toBe("Todo à récupérer");
    expect(data.completed).toBe(false);
  });

  test("GET /api/todos/:id - doit retourner 404 si le todo n'existe pas", async () => {
    const response = await fetch(`http://localhost:${port}/api/todos/${NON_EXISTENT_ID}`);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Todo non trouvé");
  });

  test("PUT /api/todos/:id - doit modifier un todo", async () => {
    const createResponse = await fetch(`http://localhost:${port}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Todo avant modification" })
    });

    const createdTodo = await createResponse.json();
    createdIds.push(createdTodo.id);

    const response = await fetch(`http://localhost:${port}/api/todos/${createdTodo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Todo après modification", completed: true })
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdTodo.id);
    expect(data.title).toBe("Todo après modification");
    expect(data.completed).toBe(true);
  });

  test("DELETE /api/todos/:id - doit supprimer un todo", async () => {
    const createResponse = await fetch(`http://localhost:${port}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Todo à supprimer" })
    });

    const createdTodo = await createResponse.json();

    const response = await fetch(`http://localhost:${port}/api/todos/${createdTodo.id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Todo supprimé");
    expect(data.todo.id).toBe(createdTodo.id);
  });

  test("PUT /api/todos/:id - doit retourner 404 si le todo n'existe pas", async () => {
    const response = await fetch(`http://localhost:${port}/api/todos/${NON_EXISTENT_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test" })
    });

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Todo non trouvé");
  });

  test("DELETE /api/todos/:id - doit retourner 404 si le todo n'existe pas", async () => {
    const response = await fetch(`http://localhost:${port}/api/todos/${NON_EXISTENT_ID}`, {
      method: "DELETE"
    });

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Todo non trouvé");
  });

});