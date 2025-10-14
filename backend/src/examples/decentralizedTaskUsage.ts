// Example usage of the decentralized Task system
import { 
  TaskType, 
  TaskPriority, 
  TaskStatus,
  FoodTask, 
  HomeworkTask, 
  EmailTask, 
  MeetingTask,
  ProjectTask,
  PersonalTask,
  WorkTask,
  HealthTask,
  SocialTask,
  OtherTask,
  getTaskModel,
  createTaskByType,
  getTasksByType
} from './models/tasks';
import User from './models/User';

// Example: Creating different types of tasks
const createTasksExamples = async (userId: string) => {
  // 1. Create a Food Task
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
  
  // 2. Create a Homework Task
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
  
  // 3. Create an Email Task
  const emailTask = new EmailTask({
    title: "Follow up with client",
    description: "Send project update email",
    taskType: TaskType.EMAIL,
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    assignee: userId,
    xpValue: 10,
    
    // Email-specific fields
    recipient: "client@company.com",
    recipientName: "John Smith",
    subject: "Project Update - Q4 Deliverables",
    emailType: "follow_up",
    priority: "high",
    isReply: false,
    draftContent: "Hi John, I wanted to update you on our progress...",
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
  });
  
  // 4. Create a Meeting Task
  const meetingTask = new MeetingTask({
    title: "Team Standup",
    description: "Daily team synchronization meeting",
    taskType: TaskType.MEETING,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    assignee: userId,
    xpValue: 5,
    startDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    
    // Meeting-specific fields
    meetingType: "team_meeting",
    attendees: [userId], // Add more attendees as needed
    meetingRoom: "Conference Room A",
    agenda: ["Review yesterday's progress", "Plan today's tasks", "Discuss blockers"],
    meetingDuration: 30,
    recurringMeeting: true,
    meetingSeriesId: "daily-standup-2024"
  });
  
  // Save all tasks
  const savedTasks = await Promise.all([
    foodTask.save(),
    homeworkTask.save(),
    emailTask.save(),
    meetingTask.save()
  ]);
  
  return savedTasks;
};

// Example: Using helper functions for dynamic task creation
const createTaskDynamically = async (taskType: TaskType, userId: string) => {
  const baseTaskData = {
    assignee: userId,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    xpValue: 10
  };
  
  // Add type-specific data based on task type
  let taskData = { ...baseTaskData };
  
  switch (taskType) {
    case TaskType.FOOD:
      taskData = {
        ...taskData,
        title: "Log Lunch",
        foodName: "Grilled Chicken Salad",
        category: "Lunch",
        calories: 350,
        protein: 25,
        carbs: 15,
        fats: 20
      };
      break;
    case TaskType.HOMEWORK:
      taskData = {
        ...taskData,
        title: "Study for Exam",
        subject: "Computer Science",
        assignmentType: "exam",
        difficulty: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      break;
    case TaskType.EMAIL:
      taskData = {
        ...taskData,
        title: "Send Thank You Email",
        recipient: "colleague@company.com",
        subject: "Thank you for your help",
        emailType: "personal"
      };
      break;
    default:
      taskData = {
        ...taskData,
        title: "Generic Task",
        description: "A generic task"
      };
  }
  
  return await createTaskByType(taskType, taskData);
};

// Example: Querying tasks by type
const getUserTasksByType = async (userId: string, taskType: TaskType) => {
  return await getTasksByType(taskType, { assignee: userId });
};

// Example: Getting all tasks for a user across all types
const getAllUserTasks = async (userId: string) => {
  const [
    foodTasks,
    homeworkTasks,
    emailTasks,
    meetingTasks,
    projectTasks,
    personalTasks,
    workTasks,
    healthTasks,
    socialTasks,
    otherTasks
  ] = await Promise.all([
    FoodTask.find({ assignee: userId }),
    HomeworkTask.find({ assignee: userId }),
    EmailTask.find({ assignee: userId }),
    MeetingTask.find({ assignee: userId }),
    ProjectTask.find({ assignee: userId }),
    PersonalTask.find({ assignee: userId }),
    WorkTask.find({ assignee: userId }),
    HealthTask.find({ assignee: userId }),
    SocialTask.find({ assignee: userId }),
    OtherTask.find({ assignee: userId })
  ]);
  
  return {
    foodTasks,
    homeworkTasks,
    emailTasks,
    meetingTasks,
    projectTasks,
    personalTasks,
    workTasks,
    healthTasks,
    socialTasks,
    otherTasks,
    totalTasks: foodTasks.length + homeworkTasks.length + emailTasks.length + 
                meetingTasks.length + projectTasks.length + personalTasks.length + 
                workTasks.length + healthTasks.length + socialTasks.length + otherTasks.length
  };
};

// Example: Adding tasks to user
const addTaskToUser = async (userId: string, taskId: string, taskType: TaskType) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const taskTypeMap = {
    [TaskType.FOOD]: 'foodTasks',
    [TaskType.HOMEWORK]: 'homeworkTasks',
    [TaskType.EMAIL]: 'emailTasks',
    [TaskType.MEETING]: 'meetingTasks',
    [TaskType.PROJECT]: 'projectTasks',
    [TaskType.PERSONAL]: 'personalTasks',
    [TaskType.WORK]: 'workTasks',
    [TaskType.HEALTH]: 'healthTasks',
    [TaskType.SOCIAL]: 'socialTasks',
    [TaskType.OTHER]: 'otherTasks'
  };
  
  const taskArray = taskTypeMap[taskType];
  if (!user.tasks[taskArray].includes(taskId)) {
    user.tasks[taskArray].push(taskId);
    await user.save();
  }
};

// Example: Task statistics across all types
const getTaskStatistics = async (userId: string) => {
  const allTasks = await getAllUserTasks(userId);
  
  const stats = {
    totalTasks: allTasks.totalTasks,
    byType: {
      food: allTasks.foodTasks.length,
      homework: allTasks.homeworkTasks.length,
      email: allTasks.emailTasks.length,
      meeting: allTasks.meetingTasks.length,
      project: allTasks.projectTasks.length,
      personal: allTasks.personalTasks.length,
      work: allTasks.workTasks.length,
      health: allTasks.healthTasks.length,
      social: allTasks.socialTasks.length,
      other: allTasks.otherTasks.length
    },
    completed: 0,
    pending: 0,
    inProgress: 0,
    totalXP: 0
  };
  
  // Calculate completion stats and XP
  Object.values(allTasks).forEach(taskArray => {
    if (Array.isArray(taskArray)) {
      taskArray.forEach(task => {
        if (task.status === TaskStatus.COMPLETED) stats.completed++;
        else if (task.status === TaskStatus.PENDING) stats.pending++;
        else if (task.status === TaskStatus.IN_PROGRESS) stats.inProgress++;
        
        stats.totalXP += task.xpValue || 0;
      });
    }
  });
  
  return stats;
};

export {
  createTasksExamples,
  createTaskDynamically,
  getUserTasksByType,
  getAllUserTasks,
  addTaskToUser,
  getTaskStatistics
};
