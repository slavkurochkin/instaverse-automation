import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: String, required: false },
    bio: { type: String, required: false },
    password: { type: String, required: true },
    id: { type: String },
});

export default mongoose.model("User", userSchema);