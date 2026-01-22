import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { CartItem } from "./CartItem";

@Entity("carts")
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "user_id", unique: true })
    userId!: number;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @OneToOne(() => User, (user) => user.cart, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
    items!: CartItem[];
}