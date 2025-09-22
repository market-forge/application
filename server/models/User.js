// Sample User Model

// Import connection
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   age: { type: Number }
// });

// const User = mongoose.model("User", userSchema);

let users = []; // Replace with DB in production

class User {
  constructor({ id, username, email, password }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
  }

  static create(data) {
    const id = users.length + 1;
    const user = new User({ id, ...data });
    users.push(user);
    return user;
  }

  static findByEmail(email) {
    return users.find(u => u.email === email);
  }

  static findById(id) {
    return users.find(u => u.id === id);
  }
}


export default User;