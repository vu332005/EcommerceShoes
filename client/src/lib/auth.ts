import { jwtVerify } from "jose";

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const secretKey = process.env.JWT_SECRET || "secret"; 
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, secret);
    return payload; 
  } catch (error) {
    return null;
  }
}