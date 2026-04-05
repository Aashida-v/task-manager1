import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("todo");
  const [tasks, setTasks] = useState({});
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // ✅ FETCH FROM GO BACKEND
  const fetchTasks = async () => {
    const res = await axios.get("http://127.0.0.1:8080/tasks");
    setTasks(res.data || {});
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  // ➕ ADD TASK
  const addTask = async () => {
    if (!task) return;

    await axios.post("http://127.0.0.1:8080/add", {
      task,
      assignee,
      priority,
      status
    });

    setTask("");
    setAssignee("");
    setStatus("todo");
  };

  // ❌ DELETE TASK
  const deleteTask = async (id) => {
    await axios.get(`http://127.0.0.1:8080/delete?id=${id}`);
  };

  // 🔄 UPDATE STATUS (simple version)
  const updateTask = async (id, newStatus) => {
    // optional: you can implement backend update later
    alert("Update not implemented in backend yet");
  };

  // 🔍 FILTER + SEARCH
  const filteredTasks = tasks
    ? Object.keys(tasks).filter(id => {
        const t = tasks[id];
        const matchFilter =
          filter === "All" || t.status === filter;
        const matchSearch =
          search === "" ||
          t.task.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
      })
    : [];

  return (
    <div className="container">
      <h1>Collaborative Task Manager</h1>
      <p>Realtime updates with Firebase Realtime Database</p>

      {/* CONTROLS */}
      <div className="controls">
        <input
          placeholder="Task title"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        <input
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        {/* ✅ STATUS DROPDOWN */}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="complete">Complete</option>
        </select>

        <button onClick={addTask}>Add Task</button>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <label>Filter:</label>
        <select onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>todo</option>
          <option>inprogress</option>
          <option>complete</option>
        </select>

        <label>Search:</label>
        <input
          placeholder="Search tasks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TASK LIST */}
      <div className="taskList">
        {filteredTasks.map(id => (
          <div className="card" key={id}>
            <h3>{tasks[id].task}</h3>

            <div className="details">
              <span><b>Assignee:</b> {tasks[id].assignee}</span>

              <span className={`priority ${tasks[id].priority}`}>
                {tasks[id].priority}
              </span>

              <span>
                <b>Status:</b> {tasks[id].status}
              </span>
            </div>

            <div className="buttons">
              <button className="edit" onClick={() => updateTask(id)}>
                Edit
              </button>

              <button className="delete" onClick={() => deleteTask(id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;