#!/usr/bin/env node
/**
 * Database Fix Script: Repair User.tasks field
 * 
 * This script fixes User documents where the 'tasks' field is an object instead of an array.
 * This can happen due to data corruption or incorrect database operations.
 * 
 * Usage:
 *   ts-node src/utils/fix-user-tasks.ts
 *   or
 *   npm run fix:user-tasks
 */

import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';

async function fixUserTasks() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database\n');

    console.log('🔍 Searching for users with corrupted tasks field...\n');

    // Find all users
    const users = await User.find({}).lean();
    console.log(`📊 Total users found: ${users.length}`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if tasks field is not an array
        if (user.tasks && !Array.isArray(user.tasks)) {
          console.log(`\n⚠️  Found corrupted user:`);
          console.log(`   ID: ${user._id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Tasks field type: ${typeof user.tasks}`);
          console.log(`   Tasks value:`, JSON.stringify(user.tasks));

          // Fix by setting tasks to empty array
          await User.updateOne(
            { _id: user._id },
            { $set: { tasks: [] } }
          );

          console.log(`   ✅ Fixed! Set tasks to empty array`);
          fixedCount++;
        }
      } catch (err: any) {
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

  } catch (error: any) {
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
if (require.main === module) {
  fixUserTasks();
}

export default fixUserTasks;

