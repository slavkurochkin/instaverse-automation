import pool from "../../db.js";

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

export { getProfile, getUserProfile, getAllProfiles };
