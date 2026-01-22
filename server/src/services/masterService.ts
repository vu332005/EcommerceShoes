import { AppDataSource } from "../config/db";
import { Tag } from "../models/Tag";
import { Category } from "../models/Category";
import { AppError } from "../utils/AppError";

const tagRepository = AppDataSource.getRepository(Tag);
const categoryRepository = AppDataSource.getRepository(Category);

export const getTagsByTypeService = async (type: string) => {
  if (!type) {
    throw new AppError("Thiếu tham số loại tag (type)", 400);
  }

  const tags = await tagRepository.find({
    where: { type: type },
    order: { name: "ASC" } 
  });

  // Trả về dữ liệu
  // Master data nếu rỗng thì trả về mảng rỗng [], không cần throw 404 -> vì vc danh sách rỗng là trg hợp hợp lệ
  return tags;
};

export const getAllCategoriesService = async () => {
  
  const categories = await categoryRepository.find({
    order: { name: "ASC" }
  });

  return categories;
};