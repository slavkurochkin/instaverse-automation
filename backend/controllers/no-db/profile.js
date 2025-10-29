import mongoose from "mongoose";
// import profiles from "../data/users.json" with { type: "json" };
import { users } from "./users.js";

// Use the shared in-memory users array instead of static JSON data
const profiles = users;

const getProfile = async (req, res) => {
  try {
    let profileId = req.userId;
    const profile = profiles.find((obj) => obj._id === profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id: _id, userId } = req.params;
    const profile = profiles.find((obj) => obj._id === userId);

    if (profile) {
      const { password, ...userWithoutPassword } = profile; // Remove password
      res.status(200).json(userWithoutPassword);
    } else {
      res.status(200).json({ message: "Profile not found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getAllProfiles = async (_req, res) => {
  try {
    const profilesWithoutPasswords = profiles.map((profile) => {
      const { password, ...profileWithoutPassword } = profile;
      return profileWithoutPassword;
    });
    res.status(200).json(profilesWithoutPasswords);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export { getProfile, getUserProfile, getAllProfiles };
