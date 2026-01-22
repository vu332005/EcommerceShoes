import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";
import { Payment } from "./Payment";
import { ColumnNumericTransformer } from "../utils/transformer";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "user_id", nullable: true })
    userId!: number;

    @Column({ 
        name: "total_amount", 
        type: "decimal", precision: 12, scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    totalAmount!: number;

    @Column({ 
        name: "shipping_fee", 
        type: "decimal", precision: 10, scale: 2, default: 0,
        transformer: new ColumnNumericTransformer()
    })
    shippingFee!: number;

    // Snapshot Info
    @Column({ name: "shipping_address" })
    shippingAddress!: string;

    @Column({ name: "shipping_phone" })
    shippingPhone!: string;

    @Column({ name: "shipping_name" })
    shippingName!: string;

    @Column({ default: "pending" })
    status!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    // Quan hệ
    @ManyToOne(() => User, (user) => user.orders, { onDelete: "SET NULL" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items!: OrderItem[];

    @OneToMany(() => Payment, (payment) => payment.order, { cascade: true })
    payments!: Payment[];
}