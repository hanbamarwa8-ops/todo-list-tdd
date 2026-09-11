import { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo } from "../src/models/todo.model.js";
import { connectDB, closeDB, getDB } from "../src/db/connection.js";
import { ObjectId } from "mongodb";

const NON_EXISTENT_ID = "507f1f77bcf86cd799439011";

let createdIds = [];

beforeAll(async () => {
  await connectDB();
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
});

describe("Todo Model", () => {

  test("doit récupérer tous les todos", async () => {
    const todos = await getAllTodos();
    expect(Array.isArray(todos)).toBe(true);
  });

  test("doit récupérer un todo par son ID", async () => {
    const todo = await createTodo("Todo à récupérer");
    createdIds.push(todo.id);

    const result = await getTodoById(todo.id);
    expect(result).toEqual(todo);
  });

  test("doit retourner null pour un todo inexistant", async () => {
    const result = await getTodoById(NON_EXISTENT_ID);
    expect(result).toBeNull();
  });

  test("doit créer un nouveau todo", async () => {
    const todo = await createTodo("Apprendre Jest");
    createdIds.push(todo.id);

    expect(todo).toEqual({
      id: expect.any(String),
      title: "Apprendre Jest",
      completed: false
    });
  });

  test("ne doit pas créer un todo sans titre", async () => {
    await expect(createTodo("")).rejects.toThrow("Le titre est requis");
  });

  test("doit modifier un todo", async () => {
    const todo = await createTodo("Todo à modifier");
    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id, {
      title: "Todo modifié",
      completed: true
    });
    expect(updated.title).toBe("Todo modifié");
    expect(updated.completed).toBe(true);
  });

  test("doit pouvoir modifier uniquement le titre", async () => {
    const todo = await createTodo("Ancien titre");
    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id, { title: "Nouveau titre" });
    expect(updated.title).toBe("Nouveau titre");
    expect(updated.completed).toBe(false);
  });

  test("doit pouvoir modifier uniquement completed", async () => {
    const todo = await createTodo("Mon todo");
    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id, { completed: true });
    expect(updated.completed).toBe(true);
    expect(updated.title).toBe("Mon todo");
  });

  test("ne doit pas modifier l'id", async () => {
    const todo = await createTodo("Todo sécurisé");
    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id, {
      id: "000000000000000000000000",
      title: "Nouveau titre"
    });
    expect(updated.id).toBe(todo.id);
  });

  test("doit retourner null pour un todo inexistant lors de la modification", async () => {
    const result = await updateTodo(NON_EXISTENT_ID, { title: "Test" });
    expect(result).toBeNull();
  });

  test("doit supprimer un todo", async () => {
    const todo = await createTodo("Todo à supprimer");
    const deleted = await deleteTodo(todo.id);
    expect(deleted).toEqual(todo);
  });

  test("ne doit pas supprimer un todo inexistant", async () => {
    const result = await deleteTodo(NON_EXISTENT_ID);
    expect(result).toBeNull();
  });

});