import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret";

export const generateTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, SECRET, { expiresIn: "15s" }); // Access token ngắn
  const refreshToken = jwt.sign(payload, SECRET, { expiresIn: "7d" }); // Refresh token dài
  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};