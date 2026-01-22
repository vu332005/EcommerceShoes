import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Product } from "./Product";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({length: 100})
  name!: string;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}