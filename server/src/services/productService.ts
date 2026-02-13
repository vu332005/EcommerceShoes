import { AppDataSource } from "../config/db";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { ProductImage } from "../models/ProductImage";    
import { Tag } from "../models/Tag";                      
import { AppError } from "../utils/AppError";
import redis from "../config/redis";

const variantRepo = AppDataSource.getRepository(ProductVariant);
const tagRepo = AppDataSource.getRepository(Tag);
const imageRepo = AppDataSource.getRepository(ProductImage);
const productRepo = AppDataSource.getRepository(Product);

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

// USER

// Lấy danh sách sản phẩm (Filter + Pagination)// Lấy danh sách sản phẩm (Filter + Pagination)
export const getProducts = async (params: ProductFilterParams) => {

  const productRepo = AppDataSource.getRepository(Product);
  const { page = 1, limit = 12, keyword, min_price, max_price, sort, tag_ids, category_id } = params;

  const query = productRepo.createQueryBuilder("product")
    .leftJoinAndSelect("product.category", "category")
    // --- SỬA ĐỔI QUAN TRỌNG ---
    // Phải dùng leftJoinAndSelect thì p.variants mới có dữ liệu
    .leftJoinAndSelect("product.variants", "variant") 
    // Chỉ lấy những tag là brand (để tối ưu, đỡ lấy nhầm size/color)
    .leftJoinAndSelect("variant.tags", "tag", "tag.type = :brandType", { brandType: 'brand' }) 
    
    // Chọn các trường cần lấy (nếu không chọn, TypeORM sẽ lấy hết, cũng được nhưng nặng)
    .select([
      "product.id", "product.name", "product.basePrice", 
      "product.thumbnailUrl", "product.handle", "product.createdAt",
      "category.name", "category.id",
      // Phải select cả variant id thì TypeORM mới map được relation
      "variant.id", 
      // Select tag để lấy tên Brand
      "tag.id", "tag.name", "tag.type"
    ]);

  // --- PHẦN FILTER GIỮ NGUYÊN ---
  if (keyword) query.andWhere("product.name ILIKE :keyword", { keyword: `%${keyword}%` });
  if (min_price) query.andWhere("product.basePrice >= :min", { min: min_price });
  if (max_price) query.andWhere("product.basePrice <= :max", { max: max_price });
  if (category_id) query.andWhere("product.categoryId = :catId", { catId: category_id });
  
  if (tag_ids) {
    const tagIdsArray = tag_ids.split(",").map(id => Number(id));
    query.andWhere("tag.id IN (:...tags)", { tags: tagIdsArray });
  }

  // sort
  if (sort === 'price_asc') query.orderBy("product.basePrice", "ASC");
  else if (sort === 'price_desc') query.orderBy("product.basePrice", "DESC");
  else query.orderBy("product.createdAt", "DESC");

  // pagination
  const skip = (page - 1) * limit;
  query.skip(skip).take(limit);

  const [rawProducts, total] = await query.getManyAndCount();

  // 2. Xử lý dữ liệu (Mapping) để đưa Brand ra ngoài
  const finalData = rawProducts.map((p: any) => {
      // Logic này bây giờ mới chạy được vì p.variants đã có dữ liệu
      const brandTag = p.variants?.find((v: any) => v.tags?.length > 0)?.tags[0];

      return {
          id: p.id,
          name: p.name,
          basePrice: p.basePrice, // TypeORM trả về basePrice (Backend), cần map đúng tên
          price: p.basePrice,     // Map thêm field price cho Frontend dùng
          thumbnailUrl: p.thumbnailUrl,
          handle: p.handle,
          category: p.category,
          // Lấy brand từ tag tìm được
          brand: brandTag ? { id: brandTag.id, name: brandTag.name } : null,
      };
  });

  return {
    data: finalData,
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
    const brandTag = variant.tags.find(tag => tag.type === 'brand');

    return {
      ...variant,
      color: colorTag ? { id: colorTag.id, name: colorTag.name, value: colorTag.name } : null, // tách màu
      size: sizeTag ? { id: sizeTag.id, value: sizeTag.name } : null, // tách size
      brand: brandTag ? { id: brandTag.id, value: brandTag.name } : null, //
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

//ADMIN

// product

export const getAllProducts = async () => {
  return await productRepo.find({
    order: { createdAt: "DESC" },
    relations: ["category"]
  });
};

export const createProduct = async (data: any) => {
  const { name, handle, basePrice, description, thumbnailUrl, categoryId } = data;

  // check trùng lặp
  const existing = await productRepo.findOneBy({ handle });
  if (existing) throw new AppError("Slug (Handle) sản phẩm đã tồn tại", 400);

  const newProduct = productRepo.create({
    name, handle, basePrice, description, thumbnailUrl, categoryId
  });

  return await productRepo.save(newProduct); // nó sẽ trả về Dữ liệu thô + ID + Timestamps + Default Values.
};

/*
// Đây là biến "newProduct" trước khi save
{
    name: "Áo Thun",
    price: 100000
}
// --> Thiếu ID, thiếu ngày tạo, thiếu trạng thái mặc định

// Đây là kết quả trả về từ hàm save
{
    id: 55,                        // <- DB tự sinh ra (Quan trọng nhất)
    name: "Áo Thun",               // <- Của bạn
    price: 100000,                 // <- Của bạn
    isActive: true,                // <- DB tự điền giá trị mặc định (Default Value)
    createdAt: "2024-01-25T...",   // <- DB tự đóng dấu thời gian
    updatedAt: "2024-01-25T..."    // <- DB tự đóng dấu thời gian
}

*/

export const updateProduct = async (id: number, data: any) => {
  //check xem sp cần thêm tồn tại k
  // [NEW] Cần load thêm variants để tí nữa còn xóa cache của bọn nó
  const product = await productRepo.findOne({ 
    where: { id },
    relations: ["variants"] 
  });
  
  if (!product) throw new AppError("Sản phẩm không tồn tại", 404);

  // Merge dữ liệu mới vào -> merge sẽ tự động lấy những field trong data đè lên product -> field data nào kco giữ nguyên -> thay cho việc phải viết thủ công: if (data.name) product.name = data.name; if (data.price) ...
  productRepo.merge(product, data);
  
  const updatedProduct = await productRepo.save(product); // trường hợp object product đã có id (đã tồn tại), hàm save sẽ tự hiểu là chạy lệnh UPDATE, không phải INSERT

  // [NEW] INVALIDATE CACHE
  // Khi sửa Product cha (VD: Tên, Category, Thumbnail), dữ liệu trong cache của Variant cũng bị cũ
  // -> Cần xóa cache của tất cả variant con.
  if (product.variants && product.variants.length > 0) {
      const keys = product.variants.map(v => `product_info:${v.id}`);
      await redis.del(keys); 
  }

  return updatedProduct;
};

export const deleteProduct = async (id: number) => {
  // [NEW] Lấy danh sách variants trước khi xóa để biết đường xóa cache
  const variants = await variantRepo.find({ where: { product: { id } } });

  const result = await productRepo.delete(id);
  if (result.affected === 0) throw new AppError("Sản phẩm không tồn tại", 404);

  // [NEW] Xóa cache Redis sau khi xóa DB thành công
  if (variants.length > 0) {
    const keys = variants.map(v => `product_info:${v.id}`);
    await redis.del(keys);
  }

  return result;
};
//variant

export const createVariant = async (productId: number, data: any) => {
  const { sku, stock, price, color, size, brand, images } = data;

  // Check SKU trùng
  const existingSku = await variantRepo.findOneBy({ sku });
  if (existingSku) throw new AppError(`SKU '${sku}' đã tồn tại`, 400);

  // Xử lý Tags (Màu/ Size/ Brand )
  const tags: Tag[] = [];
  
  //color
  if (color) { // nếu ng dùng có nhập màu thì ms chạy
    // tìm màu xem có trong bảng tag ch -> nếu ch -> tạo mới và lưu vào bảng tag -> dù tìm thấy hay tạo mới -> đẩy vào mảng tags 
    let colorTag = await tagRepo.findOneBy({ name: color, type: "color" });
    if (!colorTag) {
      colorTag = tagRepo.create({ name: color, type: "color" });
      await tagRepo.save(colorTag);
    }
    tags.push(colorTag);
  }

  if (size) {
    let sizeTag = await tagRepo.findOneBy({ name: size, type: "size" });
    if (!sizeTag) {
      sizeTag = tagRepo.create({ name: size, type: "size" });
      await tagRepo.save(sizeTag);
    }
    tags.push(sizeTag);
  }

  if (brand) {
    let t = await tagRepo.findOneBy({ name: brand, type: "brand" });
    if (!t) { t = await tagRepo.save(tagRepo.create({ name: brand, type: "brand" })); }
    tags.push(t);
  }

  // Tạo Variant
  const newVariant = variantRepo.create({
    product: { id: productId }, // Dùng object quan hệ thay vì productId trần
    sku,
    stockQuantity: Number(stock),
    priceOverride: price ? Number(price) : undefined, 
    tags: tags 
  });

  await variantRepo.save(newVariant);

  // Xử lý ảnh
  if (images && images.length > 0) { // check xem có ảnh nào đc gửi lên k
    const imgEntities = images.map((url: string, index: number) => 
      imageRepo.create({
        variant: { id: newVariant.id }, // gán ảnh vào biến thể mới tạo ở trên -> lý do ph save variant trc r ms save ảnh
        imageUrl: url,
        isThumbnail: index === 0 
      })
    );
    await imageRepo.save(imgEntities); // lưu toàn bộ ảnh xuống cùng 1 lúc
  }

  return newVariant;
};

export const updateVariant = async (variantId: number, data: any) => {
  const { sku, stock, price, color, size, brand, images } = data;

  const variant = await variantRepo.findOne({
    where: { id: variantId },
    relations: ["tags", "images"]
  });

  if (!variant) throw new AppError("Biến thể không tồn tại", 404);

  // Update thông tin cơ bản
  if (sku) variant.sku = sku;
  if (stock !== undefined) variant.stockQuantity = Number(stock);
  if (price !== undefined) variant.priceOverride = Number(price);
  /*
  lý do dùng !== undefined
    - Vì số lượng tồn kho (stock) có thể là số 0.
    - Nếu viết if (stock) thì số 0 bị coi là false -> Code sẽ bỏ qua không cập nhật.
    - !== undefined đảm bảo là dù user gửi số 0 thì vẫn cập nhật.
  */

  // Update Tags
  if (color || size || brand)  {
    const newTags: Tag[] = [];
    
    // Color
    
    // -> quyết định xem varitant này sẽ mang màu gì
    /*
    color: Là màu MỚI người dùng gửi lên (ví dụ: "Xanh").
    variant.tags.find(...): Là màu CŨ đang có trong database (ví dụ: "Đỏ").
    - || -> nếu ng dùng có gửi color -> màu mới -> sẽ lấy gtri mới - còn k thì dùng màu cũ để k bị trống màu 
    */ 
    const colorName = color || variant.tags.find(t => t.type === 'color')?.name;
    // find or create
    if (colorName) {
        let t = await tagRepo.findOneBy({ name: colorName, type: "color" });
        if (!t) t = await tagRepo.save(tagRepo.create({ name: colorName, type: "color" }));
        newTags.push(t);
    }

    // Size
    const sizeName = size || variant.tags.find(t => t.type === 'size')?.name;
    if (sizeName) {
        let t = await tagRepo.findOneBy({ name: sizeName, type: "size" });
        if (!t) t = await tagRepo.save(tagRepo.create({ name: sizeName, type: "size" }));
        newTags.push(t);
    }

    const brandName = brand || variant.tags.find(t => t.type === 'brand')?.name;
    if (brandName) {
        let t = await tagRepo.findOneBy({ name: brandName, type: "brand" });
        if (!t) t = await tagRepo.save(tagRepo.create({ name: brandName, type: "brand" }));
        newTags.push(t);
    }
    
    // vì ở đây ta thay đổi toàn bộ ds tag cũ = dsach tag mới -> vì thế nên ở trên kể cả ng dùng k sửa màu thì ta vẫn phải tìm và push màu cũ vào nếu k khi lưu variant sẽ bị thiếu
    variant.tags = newTags;
  }

  await variantRepo.save(variant); // vì id variant đã có -> save ở đây là nó sẽ update -> so sánh object variant hiện tại trong bộ nhớ với dữ liệu trong database. Nó tạo ra câu lệnh SQL để cập nhật các cột bị thay đổi như sku, stock_quantity, price_override.
  // đồng thời save này nó cũng sẽ Cập nhật quan hệ **!!

  // Update Images -> ở đây ta sẽ xóa toàn bộ ảnh lquan đi r xây lại -> vì (difing) so sánh sự tdoi khá lằng nhằng 
  /*
  Xử lý thứ tự ảnh (Reordering) 
    - Giả sử bạn có 3 ảnh: [A, B, C]. Người dùng muốn đổi thứ tự thành: [C, A, B].
      + Nếu "chỉ thêm mới": Bạn sẽ thấy không có ảnh nào mới cả (vẫn là 3 ảnh đó). Bạn phải viết code để update lại trường order hoặc logic sắp xếp cho từng ảnh. Rất phức tạp.
      + Nếu "đập đi xây lại": Bạn xóa sạch. Sau đó lưu lại lần lượt C -> A -> B. Database tự động lưu theo thứ tự mới (hoặc theo ID tăng dần mới). Việc hiển thị lên Frontend sẽ đúng ngay lập tức theo thứ tự người dùng mong muốn.
  */
  if (images) {
    await imageRepo.delete({ variant: { id: variant.id } });
    
    const imgEntities = images.map((url: string, index: number) => 
      imageRepo.create({
        variant: { id: variant.id }, 
        imageUrl: url,
        isThumbnail: index === 0
      })
    );
    await imageRepo.save(imgEntities);
  }

  // [NEW] XÓA CACHE CŨ
  // Vì giá, stock, hoặc ảnh đã thay đổi -> phải xóa cache để getCart load lại dữ liệu mới từ SQL
  await redis.del(`product_info:${variantId}`);

  return variant;
};

export const deleteVariant = async (variantId: number) => {
  const result = await variantRepo.delete(variantId);
  if (result.affected === 0) throw new AppError("Biến thể không tồn tại", 404);

  // [NEW] Xóa cache Redis
  await redis.del(`product_info:${variantId}`);
  
  return result;
};