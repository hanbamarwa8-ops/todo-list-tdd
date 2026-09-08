import { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo } from "../src/models/todo.model.js";

import fs from "fs/promises";
import path from "path";

const dataPath = path.resolve("src/data/todos.json");

let originalData;

beforeEach(async () => {
  originalData = await fs.readFile(dataPath, "utf-8");
});

afterEach(async () => {
  await fs.writeFile(dataPath, originalData);
});

describe("Todo Model", () => {

  test("doit récupérer tous les todos", async () => {
    const todos = await getAllTodos();
    expect(Array.isArray(todos)).toBe(true);
  });

  test("doit récupérer un todo par son ID", async () => {
    const todo = await createTodo("Todo à récupérer");
    const result = await getTodoById(todo.id);
    expect(result).toEqual(todo);
  });

  test("doit retourner null pour un todo inexistant", async () => {
    const result = await getTodoById(99999);
    expect(result).toBeNull();
  });

  test("doit créer un nouveau todo", async () => {
    const todo = await createTodo("Apprendre Jest");
    expect(todo).toEqual({
      id: expect.any(Number),
      title: "Apprendre Jest",
      completed: false
    });
  });

  test("ne doit pas créer un todo sans titre", async () => {
    await expect(createTodo("")).rejects.toThrow("Le titre est requis");
  });

  test("doit modifier un todo", async () => {
    const todo = await createTodo("Todo à modifier");
    const updated = await updateTodo(todo.id, {
      title: "Todo modifié",
      completed: true
    });
    expect(updated.title).toBe("Todo modifié");
    expect(updated.completed).toBe(true);
  });

  test("doit pouvoir modifier uniquement le titre", async () => {
    const todo = await createTodo("Ancien titre");
    const updated = await updateTodo(todo.id, { title: "Nouveau titre" });
    expect(updated.title).toBe("Nouveau titre");
    expect(updated.completed).toBe(false);
  });

  test("doit pouvoir modifier uniquement completed", async () => {
    const todo = await createTodo("Mon todo");
    const updated = await updateTodo(todo.id, { completed: true });
    expect(updated.completed).toBe(true);
    expect(updated.title).toBe("Mon todo");
  });

  test("ne doit pas modifier l'id", async () => {
    const todo = await createTodo("Todo sécurisé");
    const updated = await updateTodo(todo.id, {
      id: 999,
      title: "Nouveau titre"
    });
    expect(updated.id).toBe(todo.id);
  });

  test("doit retourner null pour un todo inexistant lors de la modification", async () => {
    const result = await updateTodo(99999, { title: "Test" });
    expect(result).toBeNull();
  });

  test("doit supprimer un todo", async () => {
    const todo = await createTodo("Todo à supprimer");
    const deleted = await deleteTodo(todo.id);
    expect(deleted).toEqual(todo);
  });

  test("ne doit pas supprimer un todo inexistant", async () => {
    const result = await deleteTodo(99999);
    expect(result).toBeNull();
  });

});