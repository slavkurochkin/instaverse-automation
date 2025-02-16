import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../../db.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user from the database
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const oldUser = result.rows[0];

    if (!oldUser) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordValid) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, "1234", {
      expiresIn: "1h",
    });

    res.status(200).json({ result: oldUser, token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const signup = async (req, res) => {
  console.log(req.body);
  const {
    username,
    age,
    gender,
    bio,
    favorite_style,
    email,
    password,
    confirmPassword,
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const encryptedPassword = await bcrypt.hash(password, 12);

    const newUser = await pool.query(
      "INSERT INTO users (username, age, gender, bio, favorite_style, email, password, total_posts, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        username,
        age,
        gender,
        bio,
        favorite_style,
        email,
        encryptedPassword,
        0,
        "user",
      ]
    );

    const result = newUser.rows[0];
    const token = jwt.sign({ email: result.email, id: result._id }, "1234", {
      expiresIn: "1h",
    });

    res.status(201).json({ result, token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { username, age, gender, bio, favorite_style, email } = req.body;

  try {
    // Check if the user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (existingUser.rows.length === 0) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const updatedUser = await pool.query(
      "UPDATE users SET username = $1, age = $2, gender = $3, bio = $4, favorite_style = $5, email = $6 WHERE id = $7 RETURNING *",
      [username, age, gender, bio, favorite_style, email, userId]
    );

    res.status(200).json({ result: updatedUser.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const deleteUser = async (req, res) => {
  console.log(req.params);
  const { userId } = req.params;

  try {
    // Check if the user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE _id = $1",
      [userId]
    );
    if (existingUser.rows.length === 0) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    await pool.query("DELETE FROM users WHERE _id = $1", [userId]);

    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

export { login, signup, deleteUser, updateUserProfile };
