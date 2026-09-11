import { useState, useEffect } from "react";

const API_URL = "http://localhost:3001/api/todos";

function useTasks() {
  const [taskList, setTaskList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
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

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmedText })
    });

    const newTask = await response.json();
    setTaskList((prevList) => [...prevList, newTask]);
  };

  const removeTask = async (taskId) => {
    await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });

    setTaskList((prevList) =>
      prevList.filter((task) => task.id !== taskId)
    );
  };

  const editTask = async (taskId, newText) => {
    const trimmedText = newText.trim();
    if (trimmedText === "") return;

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmedText })
    });

    const updated = await response.json();
    setTaskList((prevList) =>
      prevList.map((task) => (task.id === taskId ? updated : task))
    );
  };

  const toggleTask = async (taskId, completed) => {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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