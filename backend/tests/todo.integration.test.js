import app from "../src/app.js";
import fs from "fs/promises";
import path from "path";

const dataPath = path.resolve("src/data/todos.json");
let originalData;
let port;

beforeAll(async () => {
  originalData = await fs.readFile(dataPath, "utf-8");

  await new Promise((resolve) => {
    app.listen(0, () => {
      port = app.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  await fs.writeFile(dataPath, originalData);

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

    expect(response.status).toBe(201);
    expect(data.id).toEqual(expect.any(Number));
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

    const response = await fetch(`http://localhost:${port}/api/todos/${createdTodo.id}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdTodo.id);
    expect(data.title).toBe("Todo à récupérer");
    expect(data.completed).toBe(false);
  });

  test("GET /api/todos/:id - doit retourner 404 si le todo n'existe pas", async () => {
    const response = await fetch(`http://localhost:${port}/api/todos/99999`);
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
    const response = await fetch(`http://localhost:${port}/api/todos/99999`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test" })
    });

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Todo non trouvé");
  });

  test("DELETE /api/todos/:id - doit retourner 404 si le todo n'existe pas", async () => {
    const response = await fetch(`http://localhost:${port}/api/todos/99999`, {
      method: "DELETE"
    });

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Todo non trouvé");
  });

});