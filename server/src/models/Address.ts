import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "address_line" })
  addressLine!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  district!: string;

  @Column({ name: "phone_contact", nullable: true })
  phoneContact!: string;

  @Column({ name: "is_default", default: false })
  isDefault!: boolean;

  // Đây là cột user_id trong SQL
  @ManyToOne(() => User, (user) => user.addresses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}