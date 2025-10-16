/**
 * Test/Demo file for Organizer Agent
 * This demonstrates how to use the RAG agent to organize tasks
 */

import mongoose from "mongoose";
import { env } from "../../config/env";
import organizerAgent from "./organizerAgent";

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// Disconnect from MongoDB
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
  }
}

// ---------- TEST FUNCTIONS ----------

/**
 * Test 1: Retrieve user data
 */
async function testRetrieveUserData(userId: string) {
  console.log("\n📋 TEST 1: Retrieve User Data");
  console.log("=====================================");
  
  try {
    const userData = await organizerAgent.retrieveUserData(userId);
    
    if (userData) {
      console.log("✅ User data retrieved successfully:");
      console.log(JSON.stringify(userData, null, 2));
    } else {
      console.log("❌ User not found");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 2: Retrieve user tasks
 */
async function testRetrieveUserTasks(userId: string) {
  console.log("\n📋 TEST 2: Retrieve User Tasks");
  console.log("=====================================");
  
  try {
    const tasks = await organizerAgent.retrieveUserTasks(userId);
    
    console.log(`✅ Retrieved ${tasks.length} tasks:`);
    
    if (tasks.length > 0) {
      tasks.forEach((task, idx) => {
        console.log(`\n${idx + 1}. ${task.title}`);
        console.log(`   Status: ${task.status} | Priority: ${task.priority}`);
        console.log(`   Points: ${task.points} XP`);
        if (task.dueDate) {
          console.log(`   Due: ${task.dueDate.toISOString().split('T')[0]}`);
        }
        if (task.isOverdue) {
          console.log(`   ⚠️  OVERDUE`);
        }
      });
    } else {
      console.log("No tasks found for this user");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 3: Retrieve complete context (RAG preparation)
 */
async function testRetrieveCompleteContext(userId: string) {
  console.log("\n📋 TEST 3: Retrieve Complete Context (RAG)");
  console.log("=====================================");
  
  try {
    const context = await organizerAgent.retrieveCompleteContext(userId);
    
    console.log("✅ Complete context retrieved:");
    console.log("\n👤 User:");
    console.log(`   Name: ${context.user.name}`);
    console.log(`   Level: ${context.user.level} | XP: ${context.user.xp}`);
    console.log(`   Completed: ${context.user.totalTasksCompleted} tasks`);
    
    console.log("\n📊 Statistics:");
    console.log(`   Total Tasks: ${context.stats.totalTasks}`);
    console.log(`   Pending: ${context.stats.pendingTasks}`);
    console.log(`   In Progress: ${context.stats.inProgressTasks}`);
    console.log(`   Completed: ${context.stats.completedTasks}`);
    console.log(`   Overdue: ${context.stats.overdueTasks}`);
    
    console.log("\n📝 Formatted Context for AI:");
    console.log("-----------------------------------");
    const formattedContext = organizerAgent.formatContextForPrompt(context);
    console.log(formattedContext);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 4: Chat with organizer (OpenRouter + DeepSeek)
 */
async function testChatWithOrganizer(userId: string) {
  console.log("\n📋 TEST 4: Chat with Organizer Agent");
  console.log("=====================================");
  
  try {
    const userMessage = "What should I focus on today? Help me prioritize my tasks.";
    
    console.log(`💬 User: ${userMessage}`);
    console.log("\n🤖 Agent is thinking... (retrieving context + calling OpenRouter)");
    
    const response = await organizerAgent.chatWithOrganizer(userId, userMessage);
    
    console.log("\n✅ Agent Response:");
    console.log("-----------------------------------");
    console.log(response);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 5: Get organization suggestions
 */
async function testGetOrganizationSuggestions(userId: string) {
  console.log("\n📋 TEST 5: Get Organization Suggestions");
  console.log("=====================================");
  
  try {
    console.log("🤖 Analyzing tasks and generating suggestions...");
    
    const suggestions = await organizerAgent.getOrganizationSuggestions(userId);
    
    console.log("\n✅ Organization Suggestions:");
    console.log("-----------------------------------");
    console.log(suggestions);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 6: Get daily task plan
 */
async function testGetDailyTaskPlan(userId: string) {
  console.log("\n📋 TEST 6: Get Daily Task Plan");
  console.log("=====================================");
  
  try {
    console.log("🤖 Creating your daily task plan...");
    
    const plan = await organizerAgent.getDailyTaskPlan(userId);
    
    console.log("\n✅ Daily Task Plan:");
    console.log("-----------------------------------");
    console.log(plan);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 7: Analyze productivity
 */
async function testAnalyzeProductivity(userId: string) {
  console.log("\n📋 TEST 7: Analyze Productivity");
  console.log("=====================================");
  
  try {
    console.log("🤖 Analyzing your productivity patterns...");
    
    const analysis = await organizerAgent.analyzeProductivity(userId);
    
    console.log("\n✅ Productivity Analysis:");
    console.log("-----------------------------------");
    console.log(analysis);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 8: Get motivation
 */
async function testGetMotivation(userId: string) {
  console.log("\n📋 TEST 8: Get Motivation");
  console.log("=====================================");
  
  try {
    console.log("🤖 Generating motivational message...");
    
    const motivation = await organizerAgent.getMotivation(userId);
    
    console.log("\n✅ Motivational Message:");
    console.log("-----------------------------------");
    console.log(motivation);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 9: Test AI Provider Selection
 */
async function testAIProviderSelection() {
  console.log("\n📋 TEST 9: AI Provider Selection");
  console.log("=====================================");
  
  try {
    console.log("🔍 Testing AI provider selection...");
    
    const preferredProvider = organizerAgent.getPreferredAIProvider();
    console.log(`✅ Preferred provider: ${preferredProvider}`);
    
    // Test connectivity
    const testResult = await organizerAgent.testAIProvider();
    console.log(`✅ Provider test result:`, testResult);
    
    if (testResult.status === 'connected') {
      console.log(`✅ ${testResult.provider} is working correctly`);
    } else {
      console.log(`❌ ${testResult.provider} has issues: ${testResult.response}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 10: Test Enhanced LangChain Functions
 */
async function testEnhancedLangChainFunctions() {
  console.log("\n📋 TEST 10: Enhanced LangChain Functions");
  console.log("=====================================");
  
  try {
    console.log("🤖 Testing enhanced LangChain functions...");
    
    // Test task suggestions for goal
    console.log("\n1. Testing task suggestions for goal...");
    const suggestions = await organizerAgent.generateTaskSuggestionsForGoal(
      "Learn TypeScript and build a web application"
    );
    console.log("✅ Task Suggestions:");
    console.log(suggestions);
    
    // Test task analysis
    console.log("\n2. Testing task analysis...");
    const analysis = await organizerAgent.analyzeSpecificTask(
      "Complete the project proposal by Friday"
    );
    console.log("✅ Task Analysis:");
    console.log(analysis);
    
    // Test motivational message
    console.log("\n3. Testing motivational message...");
    const motivation = await organizerAgent.generateMotivationalMessageForTaskType(
      "coding"
    );
    console.log("✅ Motivational Message:");
    console.log(motivation);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Test 11: Test Provider Override
 */
async function testProviderOverride(userId: string) {
  console.log("\n📋 TEST 11: Provider Override");
  console.log("=====================================");
  
  try {
    console.log("🔄 Testing provider override functionality...");
    
    const preferredProvider = organizerAgent.getPreferredAIProvider();
    console.log(`Current preferred provider: ${preferredProvider}`);
    
    // Test with explicit provider selection
    console.log("\nTesting with explicit provider selection...");
    const suggestions = await organizerAgent.getOrganizationSuggestions(userId, {
      provider: preferredProvider
    });
    
    console.log("✅ Suggestions with explicit provider:");
    console.log(suggestions.substring(0, 200) + "...");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// ---------- MAIN TEST RUNNER ----------

async function runTests() {
  console.log("🚀 ORGANIZER AGENT TEST SUITE");
  console.log("=====================================\n");
  
  // Check environment variables
  if (!env.OPENROUTER_API_KEY && !env.DEEPSEEK_API_KEY) {
    console.error("❌ No AI provider configured");
    console.error("Please set either OPENROUTER_API_KEY or DEEPSEEK_API_KEY in your .env file");
    return;
  }
  
  if (env.DEEPSEEK_API_KEY) {
    console.log("✅ DeepSeek API Key is configured (LangChain)");
  }
  if (env.OPENROUTER_API_KEY) {
    console.log("✅ OpenRouter API Key is configured");
  }
  console.log(`✅ Model: deepseek-chat (Free)`);
  
  // Connect to database
  await connectDB();
  
  // Replace with an actual user ID from your database
  const testUserId = process.env['TEST_USER_ID'] || "REPLACE_WITH_ACTUAL_USER_ID";
  
  if (testUserId === "REPLACE_WITH_ACTUAL_USER_ID") {
    console.log("\n⚠️  Please set TEST_USER_ID environment variable or replace the userId in the code");
    console.log("You can get a user ID by checking your MongoDB database");
    await disconnectDB();
    return;
  }
  
  console.log(`\n🧪 Testing with User ID: ${testUserId}`);
  
  try {
    // Run tests in sequence
    
    // Basic retrieval tests (no API calls)
    await testRetrieveUserData(testUserId);
    await testRetrieveUserTasks(testUserId);
    await testRetrieveCompleteContext(testUserId);
    
    // AI-powered tests (with API calls)
    console.log("\n\n🤖 Starting AI-powered tests");
    console.log("=====================================");
    
    await testChatWithOrganizer(testUserId);
    await testGetOrganizationSuggestions(testUserId);
    await testGetDailyTaskPlan(testUserId);
    await testAnalyzeProductivity(testUserId);
    await testGetMotivation(testUserId);
    
    // Enhanced integration tests
    console.log("\n\n🔧 Starting enhanced integration tests");
    console.log("=====================================");
    
    await testAIProviderSelection();
    await testEnhancedLangChainFunctions();
    await testProviderOverride(testUserId);
    
    console.log("\n\n✅ All tests completed!");
    
  } catch (error) {
    console.error("\n❌ Test suite error:", error);
  } finally {
    // Disconnect from database
    await disconnectDB();
  }
}

// ---------- RUN TESTS ----------

// Check if this file is being run directly
if (require.main === module) {
  runTests().catch(console.error);
}

export default runTests;

