const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");

// Create Task
router.post("/", auth, async (req, res, next) => {
  try {
    const task = new Task({ ...req.body, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Get All Tasks (Supports Filtering, Search, Pagination, & Sorting)
router.get("/", auth, async (req, res, next) => {
  try {
    const { status, priority, search, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: "i" };

    const tasks = await Task.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalTasks: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
});

// Analytics Route
router.get("/analytics", auth, async (req, res, next) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.user.id });
    const completedTasks = await Task.countDocuments({ user: req.user.id, status: "Done" });
    const pendingTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage: `${completionPercentage}%`
    });
  } catch (error) {
    next(error);
  }
});

// Update Task
router.put("/:id", auth, async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Delete Task
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;