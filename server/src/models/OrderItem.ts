import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./Order";
import { ProductVariant } from "./ProductVariant";
import { ColumnNumericTransformer } from "../utils/transformer";

@Entity("order_items")
export class OrderItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "order_id" })
    orderId!: number;

    @Column({ name: "product_variant_id", nullable: true })
    variantId!: number;

    // Snapshot Info (Lưu cứng để không bị thay đổi khi sản phẩm gốc đổi tên)
    @Column({ name: "product_name" })
    productName!: string;

    @Column({ name: "variant_description", nullable: true })
    variantDescription!: string;

    @Column()
    quantity!: number;

    @Column({ 
        name: "price_at_purchase", 
        type: "decimal", precision: 10, scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    priceAtPurchase!: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order!: Order;

    @ManyToOne(() => ProductVariant, { onDelete: "SET NULL" })
    @JoinColumn({ name: "product_variant_id" })
    variant!: ProductVariant;
}