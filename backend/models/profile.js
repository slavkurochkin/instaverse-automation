import mongoose from "mongoose";

const profileSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    style: { type: Number, required: true },
    id: { type: String },
});

export default mongoose.model("Profile", profileSchema);