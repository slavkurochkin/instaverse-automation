import pool from "../../db.js";
import fs from "fs";

const getProfile = async (req, res) => {
  try {
    let profileId = req.userId;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      profileId,
    ]);
    const profile = result.rows[0];

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { password, ...userWithoutPassword } = profile;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE _id = $1", [
      userId,
    ]);

    const profile = result.rows[0];

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { password, ...userWithoutPassword } = profile;

    // Convert avatar to full URL if it's not already a full URL
    if (
      userWithoutPassword.avatar &&
      !userWithoutPassword.avatar.startsWith("http")
    ) {
      userWithoutPassword.avatar = `${req.protocol}://${req.get("host")}/images/${userWithoutPassword.avatar}`;
    }

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllProfiles = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT _id, username, age, gender, bio, favorite_style, email, 
                total_posts AS "totalPosts", role 
         FROM users`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
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

      // Get current user to check for old avatar
      const userResult = await pool.query(
        "SELECT avatar FROM users WHERE id = $1",
        [userId]
      );
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const oldAvatar = userResult.rows[0].avatar;

      // Delete old avatar if it exists and is not a default URL
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

      // Update user's avatar in database
      await pool.query("UPDATE users SET avatar = $1 WHERE id = $2", [
        `${uniqueId}.${ext}`,
        userId,
      ]);

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
