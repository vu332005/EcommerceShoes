import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Category } from "./Category";
import { ProductVariant } from "./ProductVariant";
import {ColumnNumericTransformer} from "../utils/transformer"

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    handle!: string;

    @Column({ type: "text", nullable: true })
    description!: string;

    @Column({ 
        name: "base_price", 
        type: "decimal", 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    basePrice!: number;

    @Column({ name: "thumbnail_url", nullable: true })
    thumbnailUrl!: string;

    @Column({ name: "category_id", nullable: true })
    categoryId!: number;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @ManyToOne(() => Category, (category) => category.products, { onDelete: "SET NULL" })
    @JoinColumn({ name: "category_id" })
    category!: Category;

    @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
    variants!: ProductVariant[];
}