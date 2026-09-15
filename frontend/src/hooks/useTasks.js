import { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL ||"http://localhost:3001/api/todos";

function useTasks() {
  const [taskList, setTaskList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les tâches");
      }

      const data = await response.json();

      setTaskList(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des tâches :",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };


  const addTask = async (taskText) => {
    const trimmedText = taskText.trim();

    if (trimmedText === "") return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: trimmedText
        })
      });

      if (!response.ok) {
        throw new Error("Impossible d'ajouter la tâche");
      }

      const newTask = await response.json();

      setTaskList((prevList) => [
        ...prevList,
        newTask
      ]);
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout de la tâche :",
        error
      );
    }
  };


  const removeTask = async (taskId) => {
    try {
      const response = await fetch(
        `${API_URL}/${taskId}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error("Impossible de supprimer la tâche");
      }

      setTaskList((prevList) =>
        prevList.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la tâche :",
        error
      );
    }
  };

  
  const editTask = async (taskId, newText) => {
    const trimmedText = newText.trim();

    if (trimmedText === "") return;

    try {
      const response = await fetch(
        `${API_URL}/${taskId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: trimmedText
          })
        }
      );

      if (!response.ok) {
        throw new Error("Impossible de modifier la tâche");
      }

      const updated = await response.json();

      setTaskList((prevList) =>
        prevList.map((task) =>
          task.id === taskId ? updated : task
        )
      );
    } catch (error) {
      console.error(
        "Erreur lors de la modification de la tâche :",
        error
      );
    }
  };


  const toggleTask = async (taskId, completed) => {
    try {
      const response = await fetch(
        `${API_URL}/${taskId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            completed
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de modifier l'état de la tâche"
        );
      }

      const updated = await response.json();

      setTaskList((prevList) =>
        prevList.map((task) =>
          task.id === taskId ? updated : task
        )
      );
    } catch (error) {
      console.error(
        "Erreur lors du changement d'état :",
        error
      );
    }
  };

  return {taskList,isLoading,addTask, removeTask,editTask,toggleTask};
}

export default useTasks;