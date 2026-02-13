import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from "typeorm";
import { Address } from "./Address";
import { Cart } from "./Cart";
import { Order } from "./Order";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ name: "full_name", nullable: true, length: 100 })
  fullName!: string;

  @Column({ nullable: true, length: 20 })
  phone!: string;

  @Column({ name: "avatar_url", nullable: true, type: "text" })
  avatarUrl!: string;

  @Column({ default: "customer", length: 20 }) 
  role!: string;

  // check
  @Column({ name: "login_type", default: "local", length: 20 })
  loginType!: string; // Giá trị sẽ là 'local' hoặc 'facebook'

  @Column({ name: "refresh_token", nullable: true, type: "text" })
  refreshToken!: string | null;

  // ... (giữ nguyên các relation và date)
  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart!: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}