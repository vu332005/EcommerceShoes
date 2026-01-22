import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from "typeorm";
import { Product } from "./Product";
import { ProductImage } from "./ProductImage";
import { Tag } from "./Tag";
import { ColumnNumericTransformer } from "../utils/transformer";

@Entity("product_variants")
export class ProductVariant {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "product_id" })
    productId!: number;

    @Column({ unique: true })
    sku!: string;

    @Column({ name: "stock_quantity", default: 0 })
    stockQuantity!: number;

    @Column({ 
        name: "price_override", 
        type: "decimal", 
        precision: 10, 
        scale: 2, 
        nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    priceOverride!: number;

    // Quan hệ
    @ManyToOne(() => Product, (product) => product.variants, { onDelete: "CASCADE" })
    @JoinColumn({ name: "product_id" })
    product!: Product;

    @OneToMany(() => ProductImage, (image) => image.variant, { cascade: true })
    images!: ProductImage[];

    // Many-to-Many với Tag (Bảng nối variant_tags sẽ tự được TypeORM tạo)
    @ManyToMany(() => Tag, (tag) => tag.variants, { cascade: true })
    @JoinTable({
        name: "variant_tags", // Tên bảng nối
        joinColumn: { name: "product_variant_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" }
    })
    tags!: Tag[];
}