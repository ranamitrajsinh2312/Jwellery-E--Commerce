const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Fix admin password by updating directly in database
const fixAdminPassword = async () => {
  try {
    const email = 'admin@jewelry.com';
    const password = 'admin123';
    
    console.log('\n🔧 Fixing Admin Password:');
    console.log('========================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    // Hash password manually
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update directly in database to avoid pre-save hook
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Admin password updated successfully!');
      
      // Verify the password works
      const user = await mongoose.connection.db.collection('users').findOne({ email: email });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      console.log(`🔑 Password verification: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
      
      if (isPasswordValid) {
        console.log('\n🎉 Admin login should work now!');
        console.log('Try logging in with:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
      }
    } else {
      console.log('❌ Admin user not found!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await fixAdminPassword();
};

runScript();
