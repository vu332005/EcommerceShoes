import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ProductVariant } from "./ProductVariant";

@Entity("product_images")
export class ProductImage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "product_variant_id" })
    variantId!: number;

    @Column({ name: "image_url" })
    imageUrl!: string;

    @Column({ name: "is_thumbnail", default: false })
    isThumbnail!: boolean;

    @ManyToOne(() => ProductVariant, (variant) => variant.images, { onDelete: "CASCADE" })
    @JoinColumn({ name: "product_variant_id" })
    variant!: ProductVariant;
}