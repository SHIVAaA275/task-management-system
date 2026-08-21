import { useState, useEffect } from "react";
import API from "../api";

export default function TaskDashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "Medium", status: "Todo" });

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (priority) params.append("priority", priority);

      const res = await API.get(`/tasks?${params.toString()}`);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/tasks/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAnalytics();
  }, [search, status, priority]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", newTask);
      setNewTask({ title: "", description: "", priority: "Medium", status: "Todo" });
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <button onClick={onLogout} style={{ float: "right" }}>Logout</button>
      <h2>Task Management Dashboard</h2>

      {/* Analytics Section */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", background: "#f0f0f0", padding: "10px" }}>
        <div><strong>Total:</strong> {analytics.totalTasks || 0}</div>
        <div><strong>Completed:</strong> {analytics.completedTasks || 0}</div>
        <div><strong>Pending:</strong> {analytics.pendingTasks || 0}</div>
        <div><strong>Completion:</strong> {analytics.completionPercentage || "0%"}</div>
      </div>

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} style={{ marginBottom: "20px" }}>
        <h3>Create Task</h3>
        <input
          type="text"
          placeholder="Title"
          required
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        <button type="submit" style={{ marginLeft: "10px" }}>Add Task</button>
      </form>

      {/* Filter and Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginRight: "10px" }}>
          <option value="">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Task List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li key={task._id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
            <h4>{task.title} ({task.priority} Priority)</h4>
            <p>{task.description}</p>
            <label>Status: </label>
            <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <button onClick={() => handleDelete(task._id)} style={{ marginLeft: "15px", color: "red" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}