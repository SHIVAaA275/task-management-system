const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { 
      type: String, 
      enum: ["Todo", "In Progress", "Done"], 
      default: "Todo" 
    },
    priority: { 
      type: String, 
      enum: ["Low", "Medium", "High"], 
      default: "Medium" 
    },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

// Database indexing for quick querying and filtering
TaskSchema.index({ user: 1, status: 1, priority: 1, title: "text" });

module.exports = mongoose.model("Task", TaskSchema);