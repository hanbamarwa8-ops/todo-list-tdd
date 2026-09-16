import {getAllTodos,getTodoById,createTodo,updateTodo,deleteTodo} from "../src/models/todo.model.js";

import {connectDB,closeDB,getDB} from "../src/db/connection.js";

import { ObjectId } from "mongodb";

const NON_EXISTENT_ID = "507f1f77bcf86cd799439011";

// User fictif pour les tests
const TEST_USER_ID = new ObjectId().toString();

let createdIds = [];

beforeAll(async () => {
  await connectDB();});

afterEach(async () => {
  if (createdIds.length > 0) {
    const db = getDB();

    await db.collection("todos").deleteMany({
      _id: {$in: createdIds.map((id) => new ObjectId(id))}
    });
    createdIds = [];
  }
});

afterAll(async () => {
  await closeDB();
});

describe("Todo Model", () => {

  test("doit récupérer tous les todos", async () => {
    const todos = await getAllTodos(TEST_USER_ID);

    expect(Array.isArray(todos)).toBe(true);
  });

  test("doit récupérer un todo par son ID", async () => {
    const todo = await createTodo("Todo à récupérer",TEST_USER_ID);
    createdIds.push(todo.id);

    const result = await getTodoById(todo.id,TEST_USER_ID);
    expect(result).toEqual(todo);
  });

  test("doit retourner null pour un todo inexistant", async () => {
    const result = await getTodoById(NON_EXISTENT_ID,TEST_USER_ID);
    expect(result).toBeNull();
  });

  test("doit créer un nouveau todo", async () => {
    const todo = await createTodo("Apprendre Jest",TEST_USER_ID);

    createdIds.push(todo.id);

    expect(todo).toEqual({
      id: expect.any(String),
      title: "Apprendre Jest",
      completed: false
    });
  });

  test("ne doit pas créer un todo sans titre", async () => {
    await expect(createTodo("", TEST_USER_ID)).rejects.toThrow("Le titre est requis");
  });

  test("doit modifier un todo", async () => {
    const todo = await createTodo("Todo à modifier",TEST_USER_ID);

    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id,TEST_USER_ID,
      {title: "Todo modifié",
        completed: true}
    );

    expect(updated.title).toBe("Todo modifié");
    expect(updated.completed).toBe(true);
  });

  test("doit pouvoir modifier uniquement le titre", async () => {
    const todo = await createTodo("Ancien titre",TEST_USER_ID);
    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id,TEST_USER_ID,
      {title: "Nouveau titre"}
    );

    expect(updated.title).toBe("Nouveau titre");
    expect(updated.completed).toBe(false);
  });

  test("doit pouvoir modifier uniquement completed", async () => {
    const todo = await createTodo("Mon todo",TEST_USER_ID);

    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id,TEST_USER_ID,
      {completed: true} );

    expect(updated.completed).toBe(true);
    expect(updated.title).toBe("Mon todo");
  });

  test("ne doit pas modifier l'id", async () => {
    const todo = await createTodo("Todo sécurisé",TEST_USER_ID);

    createdIds.push(todo.id);

    const updated = await updateTodo(todo.id,TEST_USER_ID,
      {
        id: "000000000000000000000000",
        title: "Nouveau titre"
      }
    );

    expect(updated.id).toBe(todo.id);
  });

  test("doit retourner null pour un todo inexistant lors de la modification", async () => {
    const result = await updateTodo(
      NON_EXISTENT_ID,
      TEST_USER_ID,
      {title: "Test"}
    );

    expect(result).toBeNull();
  });

  test("doit supprimer un todo", async () => {
    const todo = await createTodo("Todo à supprimer",TEST_USER_ID);

    createdIds.push(todo.id);

    const deleted = await deleteTodo(todo.id,TEST_USER_ID);

    expect(deleted).toEqual(todo);
  });

  test("ne doit pas supprimer un todo inexistant", async () => {
    const result = await deleteTodo(NON_EXISTENT_ID,TEST_USER_ID);

    expect(result).toBeNull();
  });

});