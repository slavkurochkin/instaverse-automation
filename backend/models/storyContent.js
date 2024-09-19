import mongoose from "mongoose";

// Define the comment sub-schema
const commentSchema = mongoose.Schema({
  username: { type: String, required: true }, // User who posted the comment
  text: { type: String, required: true }, // The comment text
  date: { type: Date, default: new Date() }, // Date the comment was posted
});

// Define the story schema
const storySchema = mongoose.Schema({
  caption: { type: String, required: true },
  username: { type: String, required: true },
  userId: { type: String, required: true },
  image: { type: String, required: true },
  tags: String,
  likes: { type: [String], default: [] },
  postDate: { type: Date, default: new Date() },
  comments: { type: [commentSchema], default: [] }, // Array of comments using commentSchema
});

// Export the Story model
export default mongoose.model("Story", storySchema);