// server/userSeed.js
import User from 'server\models\User.js';
import bcrypt from 'bcrypt';
import connectToDatabase from './db/db.js';
import dotenv from 'dotenv';

dotenv.config();

const userRegister = async () => {
  await connectToDatabase();

  try {
    const hashPassword = await bcrypt.hash("admin", 10);
    const newUser = new User({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashPassword,
      role: "admin"
    });
    await newUser.save();
    console.log("✅ Admin user inserted");
  } catch (error) {
    console.log("❌ Error inserting user:", error);
  }
};

userRegister();
