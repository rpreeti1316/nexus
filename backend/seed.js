const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const seedSuperadmin = async () => {
  try {
    await connectDB();

    const email = 'admin@nexus.com';

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Superadmin already exists!');
      process.exit();
    }

    const superadmin = await User.create({
      name: 'System Admin',
      email: email,
      password: 'superadmin123',
      role: 'superadmin'
    });

    console.log(`Superadmin created successfully! Email: ${superadmin.email}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedSuperadmin();
