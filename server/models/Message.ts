import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderAvatar?: string;
  content: string;
  image?: string;
  type: 'text' | 'image' | 'system' | 'audio';
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String },
  content: { type: String },
  image: { type: String },
  type: { 
    type: String, 
    enum: ['text', 'image', 'system', 'audio'], 
    default: 'text' 
  },
}, { 
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);