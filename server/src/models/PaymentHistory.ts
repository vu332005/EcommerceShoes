import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Payment } from "./Payment";

@Entity("payment_histories")
export class PaymentHistory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "payment_id" })
    paymentId!: number;

    @Column({ type: "jsonb", nullable: true })
    payload!: any;

    @Column({ nullable: true })
    status!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @ManyToOne(() => Payment, (payment) => payment.histories, { onDelete: "CASCADE" })
    @JoinColumn({ name: "payment_id" })
    payment!: Payment;
}