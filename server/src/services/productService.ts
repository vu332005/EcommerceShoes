import { AppDataSource } from "../config/db";
import { Product } from "../models/Product";

interface ProductFilterParams {
  page?: number;
  limit?: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  sort?: string; 
  tag_ids?: string;
  category_id?: number;
}

// Lấy danh sách sản phẩm (Filter + Pagination)
export const getProducts = async (params: ProductFilterParams) => {

  const productRepo = AppDataSource.getRepository(Product); // tạo repo để lm vc với bảng product
  const { page = 1, limit = 12, keyword, min_price, max_price, sort, tag_ids, category_id } = params; // destructuring và để mặc định nếu vào trang chủ không chọn gì -> lấy trang đầu hiển thị 12 sp

  const query = productRepo.createQueryBuilder("product")
    .leftJoinAndSelect("product.category", "category")
    .select([
      "product.id", "product.name", "product.basePrice", 
      "product.thumbnailUrl", "product.handle", "product.createdAt",
      "category.name", "category.id"
    ]);

  // filter
  if (keyword) query.andWhere("product.name ILIKE :keyword", { keyword: `%${keyword}%` }); // nếu ng dùng có lọc theo điều kiện này -> thêm where vào câu lệnh sql
  if (min_price) query.andWhere("product.basePrice >= :min", { min: min_price });
  if (max_price) query.andWhere("product.basePrice <= :max", { max: max_price });
  if (category_id) query.andWhere("product.categoryId = :catId", { catId: category_id });
  
  if (tag_ids) {
    const tagIdsArray = tag_ids.split(",").map(id => Number(id));
    query.innerJoin("product.variants", "variant")
         .innerJoin("variant.tags", "tag")
         .andWhere("tag.id IN (:...tags)", { tags: tagIdsArray });
  }

  // sort
  if (sort === 'price_asc') query.orderBy("product.basePrice", "ASC");
  else if (sort === 'price_desc') query.orderBy("product.basePrice", "DESC");
  else query.orderBy("product.createdAt", "DESC");

  // pagination
  const skip = (page - 1) * limit;
  query.skip(skip).take(limit);

  const [data, total] = await query.getManyAndCount();

  return {
    data,
    meta: { total, page, last_page: Math.ceil(total / limit) }
  };
};

// Lấy New Arrivals
export const getNewArrivals = async (limit: number = 8) => {
  const productRepo = AppDataSource.getRepository(Product);
  return await productRepo.find({
    order: { createdAt: "DESC" },
    take: limit,
    relations: ["category"],
    select: { id: true, name: true, basePrice: true, thumbnailUrl: true, handle: true }
  });
};

// lấy chi tiết sản phẩm
export const getProductDetail = async (id: number) => {
  const productRepo = AppDataSource.getRepository(Product);
  
  // 1. Lấy dữ liệu thô từ DB (Bao gồm cả quan hệ lồng nhau)
  const product = await productRepo.findOne({
    where: { id },
    relations: [
      "category", 
      "variants", 
      "variants.tags",   // Để lấy màu/size
      "variants.images"  // Lấy ảnh của từng variant
    ]
  });

  if (!product) return null;

  // gom ảnh - làm phẳng dsach ảnh
  const allImages = product.variants.flatMap(variant => {
    // Tìm tag màu trong variant này (để biết ảnh này thuộc màu nào)
    const colorTag = variant.tags.find(t => t.type === 'color');
    
    return variant.images.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      isThumbnail: img.isThumbnail,
      // Gắn thông tin màu vào ảnh để Frontend lọc
      color: colorTag ? { id: colorTag.id, name: colorTag.name, value: colorTag.name } : null
    }));
  });

  // sửa lại variant - tách màu và size ra từ tagss 
  const transformedVariants = product.variants.map((variant) => {
    const colorTag = variant.tags.find(tag => tag.type === 'color');
    const sizeTag = variant.tags.find(tag => tag.type === 'size');

    return {
      ...variant,
      color: colorTag ? { id: colorTag.id, name: colorTag.name, value: colorTag.name } : null, // tách màu
      size: sizeTag ? { id: sizeTag.id, value: sizeTag.name } : null, // tách size
      tags: undefined // Xóa tags cho gọn
    };
  });

  // -> khi này dlieu trả về sẽ phẳng - kh lồng nhau 
  return {
    ...product,
    images: allImages, 
    variants: transformedVariants
  };
};

// Lấy sản phẩm liên quan
export const getRelatedProducts = async (productId: number, categoryId: number, limit: number = 4) => {
  const productRepo = AppDataSource.getRepository(Product);
  return await productRepo.find({
    where: { 
      categoryId: categoryId,
      id: require("typeorm").Not(productId) 
    },
    take: limit,
    select: { id: true, name: true, basePrice: true, thumbnailUrl: true, handle: true }
  });
};