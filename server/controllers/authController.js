import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const createUserResponse = (user, token) => {
  return {
    success: true,
    message: "Authentication successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    },
  };
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    console.log("========== REGISTER REQUEST ==========");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Request Body:", req.body);

    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "passenger",
    });

    const token = generateToken(user._id.toString());

    return res.status(201).json(
      createUserResponse(user, token)
    );
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register user",
      error: error.message,
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    console.log("========== LOGIN REQUEST ==========");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Request Body:", req.body);

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json(
      createUserResponse(user, token)
    );
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
      error: error.message,
    });
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get user information",
      error: error.message,
    });
  }
};