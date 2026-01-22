import { AppDataSource } from "../config/db";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";
import { generateTokens, verifyToken } from "../utils/jwtHelper";

const userRepository = AppDataSource.getRepository(User);

export const registerService = async (data: any) => {
  const { email, password, full_name, phone } = data;

  if (!email || !password) throw new AppError("Thiếu thông tin đăng ký", 400);

  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) throw new AppError("Email đã tồn tại", 409);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Khi lưu vào DB, phải map vào property fullName của Entity
  const newUser = userRepository.create({
    email,
    password: hashedPassword,
    fullName: full_name, 
    phone,
  });

  await userRepository.save(newUser);
  return { user_id: newUser.id, message: "Đăng ký thành công" };
};

export const loginService = async (data: any) => {
  const { email, password } = data;

  const user = await userRepository.findOneBy({ email });
  if (!user) throw new AppError("Sai email hoặc mật khẩu", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Sai email hoặc mật khẩu", 401);

  const tokens = generateTokens({ id: user.id, role: user.role });

  user.refreshToken = tokens.refreshToken;
  await userRepository.save(user);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user_info: {
      id: user.id,
      email: user.email,
      full_name: user.fullName, // SỬA: Lấy từ user.fullName
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatarUrl // SỬA: Lấy từ user.avatarUrl
    }
  };
};

export const refreshTokenService = async (oldRefreshToken: string) => {
  if (!oldRefreshToken) throw new AppError("Token không hợp lệ", 403);

  let decoded: any;
  try {
    decoded = verifyToken(oldRefreshToken);
  } catch (err) {
    throw new AppError("Token hết hạn hoặc không hợp lệ", 403);
  }

  const user = await userRepository.findOneBy({ id: decoded.id });
  
  // Kiểm tra user tồn tại và token khớp
  if (!user || user.refreshToken !== oldRefreshToken) {
    throw new AppError("Token không hợp lệ (Đã logout hoặc bị thay đổi)", 403);
  }

  const tokens = generateTokens({ id: user.id, role: user.role });
  
  // (Tùy chọn) Cập nhật refresh token mới để xoay vòng
  // user.refreshToken = tokens.refreshToken;
  // await userRepository.save(user);

  return { newAccessToken: tokens.accessToken };
};

export const logoutService = async (userId: number) => {
  await userRepository.update(userId, { refreshToken: null });
  return { message: "Đăng xuất thành công" };
};

export const getMeService = async (userId: number) => {
  const user = await userRepository.findOneBy({ id: userId });
  if (!user) throw new AppError("Không tìm thấy user", 404);
  
  // Trả về dữ liệu đã map đúng tên field cho Frontend
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName, 
    phone: user.phone,
    role: user.role,
    avatar_url: user.avatarUrl, 
    created_at: user.createdAt
  };
};