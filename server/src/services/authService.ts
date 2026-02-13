import { AppDataSource } from "../config/db";
import { User } from "../models/User";
import { Address } from "../models/Address";
import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";
import { generateTokens, verifyToken } from "../utils/jwtHelper";
import axios from "axios";

const userRepository = AppDataSource.getRepository(User);
const addressRepository = AppDataSource.getRepository(Address);

export const registerService = async (data: any) => {
  const { email, password, full_name, phone } = data;

  if (!email || !password) throw new AppError("Thiếu thông tin đăng ký", 400);

  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) throw new AppError("Email đã tồn tại", 409);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

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
      full_name: user.fullName, 
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatarUrl 
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

  return { accessToken: tokens.accessToken };
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

export const updateProfileService = async (userId: number, data: any) => {
  const user = await userRepository.findOneBy({ id: userId });
  if (!user) throw new AppError("Người dùng không tồn tại", 404);

  // Cập nhật thông tin cơ bản của bảng user -> partial update -> dùng các câu lệnh if để xem fe gửi gì lên thì cập nhật cái đó th k thì giữ nguyên
  if (data.full_name) user.fullName = data.full_name;
  if (data.phone) user.phone = data.phone;
  if (data.avatar_url) user.avatarUrl = data.avatar_url;
  
  await userRepository.save(user);

  // Cập nhật địa chỉ 
  // Chỉ chạy nếu client có gửi lên 1 trong các trường địa chỉ
  if (data.address || data.city || data.district) {
    // Tìm địa chỉ mặc định của user này
    let address = await addressRepository.findOne({ 
      where: { user: { id: userId }, isDefault: true } 
    });

    // Nếu chưa có thì tạo mới
    if (!address) {
      address = addressRepository.create({ 
        user: { id: userId }, 
        isDefault: true 
      });
    }

    // gán dlieu
    if (data.address) address.addressLine = data.address;
    if (data.city) address.city = data.city;
    if (data.district) address.district = data.district;
    if (data.phone) address.phoneContact = data.phone; 
    
    await addressRepository.save(address);
  }

  //Trả về dữ liệu đã gộp (user + address) để Frontend cập nhật Redux
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone,
    avatar_url: user.avatarUrl,
    role: user.role,
    // Trả thêm các trường địa chỉ (nếu có)
    address: data.address,
    city: data.city,
    district: data.district
  };
};

// dùng thư viện @greatsumini/react-facebook-login -> xử lý logic frontend -> truyền appId để fb bt ng dùng đang muốn đăng nhập vào web nào
// đăng nhập thành công -> nhận về 1 access token -> ném nó về backend, 
// ở backend dungf access token này gọi api của fb để lấy thông tin ng dùng của access token này 
export const loginFacebookService = async (accessToken: string) => {
  try {

// check xem có đúng phải token của app mình k
    
    // Lấy App ID và Secret từ biến môi trường
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    // Tạo App Access Token (Chìa khóa để check)
    const appAccessToken = `${appId}|${appSecret}`;

    // Gọi API debug_token của Facebook để soi thông tin token client gửi lên
    const verifyRes = await axios.get("https://graph.facebook.com/debug_token", {
      params: {
        input_token: accessToken, // Token từ Frontend gửi lên
        access_token: appAccessToken, // Token bảo mật của Server
      },
    });

    const tokenData = verifyRes.data.data;

    // Check 1: Token có hợp lệ (chưa hết hạn/không bị fake) 
    if (!tokenData.is_valid) {
      throw new AppError("Token Facebook không hợp lệ hoặc đã hết hạn", 401);
    }

    // Check 2: Token này có đúng là cấp cho App ID của mình k? **(QUAN TRỌNG)
    // Nếu ID này khác ID trong .env -> Có kẻ đang dùng token của App khác để lừa 
    if (tokenData.app_id !== appId) {
      throw new AppError("Cảnh báo: Token này không thuộc về ứng dụng Shoes Shop!", 403);
    }

// lấy thông tin user khi đã check xong
    const { data } = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email,picture",
        access_token: accessToken,
      },
    });

    const { email, name, picture, id: facebookId } = data;

    // Facebook không bắt buộc có email (đăng ký bằng SĐT), nên cần check
    if (!email) {
      throw new AppError("Tài khoản Facebook này không có email (hoặc chưa public). Vui lòng cập nhật email trên Facebook.", 400);
    }

// xử lý db

    // Tìm user trong DB theo email
    let user = await userRepository.findOneBy({ email });

    // Nếu chưa có -> Tạo user mới
    if (!user) {
      // Tạo mật khẩu ngẫu nhiên (vì user login bằng FB không cần pass, nhưng DB yêu cầu)
      const randomPassword = Math.random().toString(36).slice(-8) + "Fb@123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = userRepository.create({
        email,
        password: hashedPassword,
        fullName: name,
        avatarUrl: picture?.data?.url, // Lấy link ảnh
        role: "customer",
        loginType: "facebook"
        // facebookId: facebookId 
      });

      await userRepository.save(user);
    } 

// tạo JWT 
  
    const tokens = generateTokens({ id: user.id, role: user.role });
    
    // Lưu refresh token vào DB
    user.refreshToken = tokens.refreshToken;
    await userRepository.save(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user_info: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        avatar_url: user.avatarUrl,
      },
    };

  } catch (error: any) {
    console.error("Lỗi FB Login:", error?.response?.data || error.message);
    
    // Ném lỗi ra để Controller bắt
    if (error instanceof AppError) throw error;
    throw new AppError("Xác thực Facebook thất bại", 401);
  }
};