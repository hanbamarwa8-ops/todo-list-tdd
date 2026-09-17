import { useState, useEffect } from "react";
import { authFetch, TODOS_URL } from "./authFetch";

function useTasks() {
  const [taskList, setTaskList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await authFetch(TODOS_URL);
      if (!response.ok) {
        setTaskList([]);
        return;
      }
      const data = await response.json();
      setTaskList(data);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskText) => {
    const trimmedText = taskText.trim();
    if (trimmedText === "") return;

    const response = await authFetch(TODOS_URL, {
      method: "POST",
      body: JSON.stringify({ title: trimmedText })
    });

    const newTask = await response.json();
    setTaskList((prevList) => [...prevList, newTask]);
  };

  const removeTask = async (taskId) => {
    await authFetch(`${TODOS_URL}/${taskId}`, { method: "DELETE" });

    setTaskList((prevList) =>
      prevList.filter((task) => task.id !== taskId)
    );
  };

  const editTask = async (taskId, newText) => {
    const trimmedText = newText.trim();
    if (trimmedText === "") return;

    const response = await authFetch(`${TODOS_URL}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ title: trimmedText })
    });

    const updated = await response.json();
    setTaskList((prevList) =>
      prevList.map((task) => (task.id === taskId ? updated : task))
    );
  };

  const toggleTask = async (taskId, completed) => {
    const response = await authFetch(`${TODOS_URL}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ completed })
    });

    const updated = await response.json();
    setTaskList((prevList) =>
      prevList.map((task) => (task.id === taskId ? updated : task))
    );
  };

  return { taskList, isLoading, addTask, removeTask, editTask, toggleTask };
}

export default useTasks;