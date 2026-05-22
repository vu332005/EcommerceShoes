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

  // ID của người gửi (if msg is sended by user -> senderId is userId , if msg is sended by admin -> senderId is adminId)
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
/**
Tóm lại cách hoạt động:
Khi một User có ID là 5 vào chat với nội dung "Cho mình hỏi giá", bảng sẽ lưu một dòng với user_id = 5, senderRole = 'user', senderId = 5.
Khi Admin có ID là 99 vào trả lời "Giá là 100k bạn nhé"
->  bảng sẽ lưu một dòng mới vẫn có user_id = 5 (vì tin nhắn này nằm trong phòng chat của User 5), nhưng senderRole = 'admin' và senderId = 99.
 
*/