// Example usage of the polymorphic Task system
import { Task, FoodTask, HomeworkTask, TaskType, TaskPriority, TaskStatus } from './models/Task';
import User from './models/User';

// Example: Creating a Food Task
const createFoodTask = async (userId: string) => {
  const foodTask = new FoodTask({
    title: "Log Breakfast",
    description: "Track morning meal nutrition",
    taskType: TaskType.FOOD,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    assignee: userId,
    xpValue: 15,
    
    // Food-specific fields
    foodName: "Avocado Toast with Eggs",
    category: "Breakfast",
    calories: 450,
    protein: 18,
    carbs: 35,
    fats: 28,
    fiber: 8,
    cost: 4.50,
    cookTime: 10,
    ingredients: ["avocado", "whole grain bread", "eggs", "salt", "pepper"],
    healthRating: 4,
    moodAfterEating: "Energized",
    source: "Home-cooked",
    loggedAt: new Date(),
    aiSuggestions: {
      substitute: "Try adding spinach for extra nutrients",
      tip: "Consider adding chia seeds for omega-3s"
    }
  });
  
  return await foodTask.save();
};

// Example: Creating a Homework Task
const createHomeworkTask = async (userId: string) => {
  const homeworkTask = new HomeworkTask({
    title: "Complete Math Assignment",
    description: "Solve calculus problems for Chapter 5",
    taskType: TaskType.HOMEWORK,
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    assignee: userId,
    xpValue: 25,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    
    // Homework-specific fields
    subject: "Calculus",
    assignmentType: "problem_set",
    difficulty: "hard",
    estimatedStudyTime: 120, // 2 hours
    materials: ["Calculus Textbook", "Graphing Calculator", "Notebook"],
    studyNotes: "Focus on integration techniques and applications",
    isGroupWork: false
  });
  
  return await homeworkTask.save();
};

// Example: Querying tasks polymorphically
const getUserTasks = async (userId: string) => {
  // Get all tasks for a user (includes all types)
  const allTasks = await Task.find({ assignee: userId })
    .populate('assignee', 'name email')
    .sort({ createdAt: -1 });
  
  // Get only food tasks
  const foodTasks = await FoodTask.find({ assignee: userId });
  
  // Get only homework tasks
  const homeworkTasks = await HomeworkTask.find({ assignee: userId });
  
  return { allTasks, foodTasks, homeworkTasks };
};

// Example: Adding task to user
const addTaskToUser = async (userId: string, taskId: string) => {
  const user = await User.findById(userId);
  if (user && !user.tasks.includes(taskId)) {
    user.tasks.push(taskId);
    await user.save();
  }
};

// Example: Getting task statistics
const getTaskStats = async (userId: string) => {
  const stats = await Task.aggregate([
    { $match: { assignee: userId } },
    {
      $group: {
        _id: '$taskType',
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', TaskStatus.COMPLETED] }, 1, 0] } },
        totalXP: { $sum: '$xpValue' }
      }
    }
  ]);
  
  return stats;
};

export {
  createFoodTask,
  createHomeworkTask,
  getUserTasks,
  addTaskToUser,
  getTaskStats
};
