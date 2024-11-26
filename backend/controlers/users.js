import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.js";
import users from "../data/users.json" assert { type: "json" };
import user from "../models/user.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = users.find((t) => t.email === email);
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
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const signup = async (req, res) => {
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
    const oldUser = users.find((t) => t.email === email);
    if (oldUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const encryptedPassword = await bcrypt.hash(password, 12);
    //const result = await User.create({ username, email, password: encryptedPassword });
    let id = users.length + 1;

    const calculateAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDifference = today.getMonth() - birth.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      return age;
    };

    const birthDate = req.body.age;
    const age = calculateAge(birthDate);

    let result = {
      _id: id.toString(),
      username: username,
      role: "user",
      age: age,
      gender: gender,
      bio: bio,
      favorite_style: favorite_style,
      email: email,
      totalPosts: 0,
      password: encryptedPassword,
    };
    users.push(result);
    const token = jwt.sign({ email: result.email, id: result._id }, "1234", {
      expiresIn: "1h",
    });

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const updateUserProfile = async (req, res) => {
  const { id: _id, userId } = req.params;

  const { username, age, gender, bio, favorite_style, email } = req.body;

  try {
    const userIndex = users.findIndex((t) => t._id === userId);
    if (userIndex === -1) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const updatedUser = {
      ...users[userIndex],
      username,
      age,
      gender,
      bio,
      favorite_style,
      email,
    };
    users[userIndex] = updatedUser;

    res.status(200).json({ result: updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const deleteUser = async (req, res) => {
  const { id: _id, userId } = req.params;

  try {
    const userIndex = users.findIndex((t) => t._id === userId);
    if (userIndex === -1) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    users.splice(userIndex, 1);

    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

export { login, signup, deleteUser, updateUserProfile, users };
