import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Cart } from "./Cart";
import { ProductVariant } from "./ProductVariant";

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "cart_id" })
    cartId!: number;

    @Column({ name: "product_variant_id" })
    variantId!: number;

    @Column({ default: 1 })
    quantity!: number;

    @Column({ nullable: true })
    note!: string;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cart_id" })
    cart!: Cart;

    @ManyToOne(() => ProductVariant)
    @JoinColumn({ name: "product_variant_id" })
    variant!: ProductVariant;
}