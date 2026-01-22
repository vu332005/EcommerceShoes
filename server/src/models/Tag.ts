import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { ProductVariant } from "./ProductVariant";

@Entity("tags")
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    type!: string;

    @ManyToMany(() => ProductVariant, (variant) => variant.tags)
    variants!: ProductVariant[];
}