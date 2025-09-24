// Sample User Model

// Import connection
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number }
});

// Use "users" as the collection name (matches your MongoDB)
const User = mongoose.model("User", userSchema, "users");

export default User;