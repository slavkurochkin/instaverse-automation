import mongoose from "mongoose";
// import profiles from "../data/users.json" with { type: "json" };
import { users } from "./users.js";
import fs from "fs";

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

      // Convert avatar to full URL if it's not already a full URL
      if (
        userWithoutPassword.avatar &&
        !userWithoutPassword.avatar.startsWith("http")
      ) {
        userWithoutPassword.avatar = `${req.protocol}://${req.get("host")}/images/${userWithoutPassword.avatar}`;
      }

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

const uploadProfileImage = async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.userId;

    if (!image) {
      return res.status(400).json({ message: "Image data is required" });
    }

    // Handle Base64 image
    if (image && image.startsWith("data:image")) {
      const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      const ext = matches[1]; // Extract file extension (e.g., png, jpg)
      const base64Data = matches[2]; // Extract Base64 content
      const uniqueId =
        Date.now().toString(36) + Math.random().toString(36).substring(2);
      const imagePath = `public/images/${uniqueId}.${ext}`;

      // Write the image file
      fs.writeFileSync(imagePath, Buffer.from(base64Data, "base64"));

      // Find the user profile
      const userIndex = profiles.findIndex((user) => user._id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old avatar if it exists and is not a default URL
      const oldAvatar = profiles[userIndex].avatar;
      if (
        oldAvatar &&
        !oldAvatar.startsWith("http") &&
        !oldAvatar.startsWith("https://api.dicebear.com")
      ) {
        const oldImagePath = `public/images/${oldAvatar}`;
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error(`Failed to delete old avatar: ${oldImagePath}`, err);
          }
        });
      }

      // Update user's avatar
      profiles[userIndex].avatar = `${uniqueId}.${ext}`;

      // Return success response with full URL
      const avatarUrl = `${req.protocol}://${req.get("host")}/images/${uniqueId}.${ext}`;

      res.status(200).json({
        message: "Profile image uploaded successfully",
        avatar: avatarUrl,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid image format. Expected base64 data URL." });
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Failed to upload profile image" });
  }
};

export { getProfile, getUserProfile, getAllProfiles, uploadProfileImage };
