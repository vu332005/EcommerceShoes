import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  // User mà cuộc hội thoại thuộc về (luôn là user, không phải admin)
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id" })
  userId!: number;

  @Column({ type: "text" })
  content!: string;

  // 'user' = do user gửi, 'admin' = do admin trả lời
  @Column({ name: "sender_role", length: 10 })
  senderRole!: "user" | "admin";

  // ID của người gửi (userId nếu user, adminId nếu admin)
  @Column({ name: "sender_id" })
  senderId!: number;

  // Tên hiển thị của người gửi
  @Column({ name: "sender_name", length: 100 })
  senderName!: string;

  @Column({ name: "is_read", default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
