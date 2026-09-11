import { useState } from "react";
import useTasks from "../hooks/useTasks";
import "./Todo.css";

function Todo() {
  const { taskList, isLoading, addTask, removeTask, editTask, toggleTask } = useTasks();
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle);
    setNewTitle("");
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const confirmEdit = (id) => {
    if (!editingText.trim()) return;
    editTask(id, editingText);
    setEditingId(null);
    setEditingText("");
  };

  if (isLoading) {
    return <div className="app">Chargement des tâches...</div>;
  }

  return (
    <div className="app">
      <h1 className="app-title">My Task App</h1>

      <form onSubmit={handleAdd} className="add-task-row">
        <input
          type="text"
          className="new-task-input"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nouvelle tâche..."
        />
        <button type="submit" className="btn btn-add">
          <span className="material-symbols-outlined">add</span>
          Ajouter
        </button>
      </form>

      <ul className="task-list">
        {taskList.map((task) => (
          <li
            key={task.id}
            className={`task-item${task.completed ? " completed" : ""}`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id, !task.completed)}
            />

            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  className="task-edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit(task.id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                  autoFocus
                />
                <button className="btn btn-save" onClick={() => confirmEdit(task.id)}>
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="btn btn-cancel" onClick={cancelEditing}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </>
            ) : (
              <>
                <span className="task-text">{task.title}</span>
                <button className="btn btn-edit" onClick={() => startEditing(task)}>
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="btn btn-delete" onClick={() => removeTask(task.id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {taskList.length === 0 && <p>Aucune tâche pour le moment.</p>}
    </div>
  );
}

export default Todo;