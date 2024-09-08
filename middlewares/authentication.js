import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "User Not authenticated", success: false });
    }

    const decodeToken = await jwt.verify(token, process.env.SECRET_KEY);

    if (!decodeToken) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.id = decodeToken.userId;
    next();
  } catch (error) {
    console.log("Authentication Error", error);
  }
};

export default isAuthenticated;
