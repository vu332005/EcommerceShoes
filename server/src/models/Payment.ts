import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Order } from "./Order";
import { PaymentHistory } from "./PaymentHistory"
import { ColumnNumericTransformer } from "../utils/transformer";

@Entity("payments")
export class Payment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "order_id" })
    orderId!: number;

    @Column({ name: "payment_method", nullable: true })
    paymentMethod!: string;

    @Column({ name: "transaction_id", nullable: true })
    transactionId!: string;

    @Column({ 
        type: "decimal", precision: 10, scale: 2, nullable: true,
        transformer: new ColumnNumericTransformer()
    })
    amount!: number;

    @Column({ default: "pending" })
    status!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @ManyToOne(() => Order, (order) => order.payments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order!: Order;

    @OneToMany(() => PaymentHistory, (history) => history.payment, { cascade: true })
    histories!: PaymentHistory[];
}