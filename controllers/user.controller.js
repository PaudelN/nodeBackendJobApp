import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//User Registration API
export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;
    

    //checking if user enters all the input credentials or not
    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Something is missing in the input fields",
        success: false,
      });
    }

    //checking if user is already signed in with this email or not
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    //hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //entering/creating user in the database
    await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "User Registration Error",
      success: false,
    });
  }
};

//User Login API
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    //checking if user enters all the input credentials or not
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing in the input fields",
        success: false,
      });
    }

    //checking if user exists with this email or not
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User do not exists",
        success: false,
      });
    }

    //checking if user is logging with correct password or not
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: "Password is incorrect",
        success: false,
      });
    }

    //checking if user is logging with correct role or not
    if (role != user.role) {
      return res.status(400).json({
        message: "You are not authorized to access with this role",
        success: false,
      });
    }

    //Generating Token
    const tokenDetails = {
      userId: user._id,
    };

    const token = await jwt.sign(tokenDetails, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      email: user.email,
      profile: user.profile,
    };

    return (
      res
        .status(200)
        //storing the token details in a cookie
        .cookie("token", token, {
          maxAge: 1 * 24 * 60 * 60 * 1000, //setting up the maximum age for the cookie to exists which is one day
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .json({
          message: `Welcome back ${user.fullName}`,
          user,
          success: true,
        })
    );
  } catch (error) {
    console.log("Login Error", error);
  }
};

//User Logout API
export const logout = async (req, res) => {
  try {
    //clearing out the stored tooken with the help of cookie clear to perform logout functionality
    return res
      .status(200)
      .clearCookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.log("Logout error", error);
  }
};

//User Profile Updation API
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;

    //--todo for file updation
    const file = req.file;

    //---later to do for files such as for resume(we would be using cloudinary)
    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }

    //----later to do for authentication middleware
    const userId = req.id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "You are not Authenticated",
        success: false,
      });
    }

    //updating user profile data here
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    //resume file comes here later

    await user.save();

    user = {
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      email: user.email,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile Updated Successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.log("Profile Updation Error", error);
  }
};
