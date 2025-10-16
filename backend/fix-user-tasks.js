/**
 * Database Fix Script: Repair User.tasks field (JavaScript version)
 * 
 * This script fixes User documents where the 'tasks' field is an object instead of an array.
 * 
 * Usage:
 *   node fix-user-tasks.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lvl-ai';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

async function fixUserTasks() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database\n');

    console.log('🔍 Searching for users with corrupted tasks field...\n');

    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users
    const users = await usersCollection.find({}).toArray();
    console.log(`📊 Total users found: ${users.length}`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if tasks field exists and is not an array
        if (user.tasks !== undefined && user.tasks !== null && !Array.isArray(user.tasks)) {
          console.log(`\n⚠️  Found corrupted user:`);
          console.log(`   ID: ${user._id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Tasks field type: ${typeof user.tasks}`);
          console.log(`   Tasks value:`, JSON.stringify(user.tasks));

          // Fix by setting tasks to empty array
          const result = await usersCollection.updateOne(
            { _id: user._id },
            { $set: { tasks: [] } }
          );

          if (result.modifiedCount > 0) {
            console.log(`   ✅ Fixed! Set tasks to empty array`);
            fixedCount++;
          } else {
            console.log(`   ⚠️  No changes made (already fixed?)`);
          }
        }
      } catch (err) {
        console.error(`   ❌ Error fixing user ${user._id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`Total users checked: ${users.length}`);
    console.log(`Users fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (fixedCount > 0) {
      console.log('\n✅ Database repair complete!');
      console.log('💡 You can now create tasks without errors.');
    } else {
      console.log('\n✅ No corrupted users found. Database is healthy!');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the fix
fixUserTasks();

