import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  article: { type: Object, required: true }, // store full article object
});

export default mongoose.model("Favorite", favoriteSchema);

