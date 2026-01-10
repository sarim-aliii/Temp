import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import { ClientAction, AuthenticatedSocket, ChatMessage } from '../types';
import { roomState, getDefaultRoomState } from '../state/roomStore';
import JournalEntry from '../models/JournalEntry';
import User from '../models/User';
import Message from '../models/Message';
import Logger from '../utils/logger';
import { sendNotification } from '../utils/pushService';


export const handleClientAction = async (
  io: Server,
  socket: Socket,
  user: any,
  action: ClientAction
) => {
  const authSocket = socket as unknown as AuthenticatedSocket;
  const rid = authSocket.roomId;

  if (!rid || !roomState[rid]) return;

  Logger.debug(`[Room: ${rid}] Action: ${action.type} from ${user.email}`);

  const currentState = roomState[rid];
  const serverTime = Date.now();

  // Handle buffering recovery
  if (authSocket.isBuffering) {
    if (['UPDATE_PLAYBACK_STATE', 'UPDATE_PLAYBACK_TIME'].includes(action.type)) {
      authSocket.isBuffering = false;
      socket.to(rid).emit('partnerBuffering', false);
    }
  }

  switch (action.type) {
    case 'UPDATE_PLAYBACK_STATE':
      currentState.playbackState = {
        ...currentState.playbackState,
        ...action.payload,
        lastUpdateTimestamp: serverTime,
      };
      break;

    case 'UPDATE_VIDEO_SOURCE':
      currentState.videoSource = action.payload;
      currentState.playbackState = {
        ...getDefaultRoomState().playbackState,
        isPlaying: false,
        lastUpdateTimestamp: serverTime,
      };
      currentState.isScreenSharing = action.payload.type === 'screen';
      break;

    case 'SEND_MESSAGE': {
      const { content, type = 'text', image } = action.payload;

      // 1. Construct the message object matching ChatMessage interface
      const messageData: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: user._id.toString(),
        senderName: user.name,
        senderAvatar: user.avatar,
        content: content || (image ? 'Image Attachment' : ''), // Fallback content if only image
        image: image, // Add image to payload
        type: type as 'text' | 'audio' | 'image' | 'system',
        timestamp: new Date().toISOString(),
      };

      // 2. Emit to Room
      io.to(rid).emit('newChatMessage', messageData);

      // 3. Update in-memory state
      if (currentState.messages.length > 50) currentState.messages.shift();
      currentState.messages.push(messageData);
      roomState[rid] = currentState;

      // 4. PERSIST: Save to MongoDB
      try {
        await Message.create({
          roomId: rid,
          senderId: user._id,
          senderName: user.name,
          senderAvatar: user.avatar,
          content: content || (image ? 'Image Attachment' : ''),
          image: image, // Persist image
          type
        });
      } catch (error) {
        Logger.error("❌ Failed to save message to DB:", error);
      }

      try {
        const partner = await User.findById(user.pairedWithUserId);
        if (partner && partner.pushSubscription) {
          const payload = {
            title: user.name || 'Partner',
            body: action.payload.content || (image ? 'Sent an image' : 'New Message'),
            url: '/', // Link to open
            icon: '/pwa-192x192.png'
          };
          sendNotification(partner.pushSubscription, payload);
        }
      } catch (err) {
        console.error("Push trigger failed:", err);
      }

      return;
    }

    case 'SET_TYPING':
      currentState.typingUser = action.payload.isTyping ? user.email : null;
      socket.to(rid).emit('partnerTyping', currentState.typingUser);
      roomState[rid] = currentState;
      return;

    case 'UPDATE_PLAYBACK_TIME':
      currentState.playbackState.currentTime = action.payload.currentTime;
      currentState.playbackState.lastUpdateTimestamp = serverTime;
      break;

    case 'UPDATE_UI_STATE':
      currentState.uiState = { ...currentState.uiState, ...action.payload };
      break;

    case 'SET_AMBIENT_SOUND':
      currentState.ambientSound = { ...currentState.ambientSound, ...action.payload };
      break;

    case 'CREATE_JOURNAL_ENTRY':
      try {
        const newEntry = new JournalEntry({
          roomId: rid,
          authorId: user._id,
          content: action.payload.content,
        });
        const savedEntry = await newEntry.save();
        const clientEntry = {
          _id: savedEntry._id.toString(),
          roomId: savedEntry.roomId,
          authorId: savedEntry.authorId.toString(),
          content: savedEntry.content,
          createdAt: savedEntry.createdAt,
          updatedAt: savedEntry.updatedAt,
        };
        currentState.journalEntries.push(clientEntry as any);
        io.to(rid).emit('newJournalEntry', clientEntry);
        roomState[rid] = currentState;
        return;
      } catch (e) {
        Logger.error("Failed to save journal entry:", e);
        socket.emit('error', { message: 'Failed to save journal entry.' });
        return;
      }

    case 'CHECK_PREMIUM_STATUS':
      try {
        const freshUser = await User.findById(user._id);
        const partner = await User.findById(user.pairedWithUserId);
        const isRoomPremium = (freshUser?.isPremium) || (partner?.isPremium) || false;

        if (isRoomPremium && !currentState.isPremium) {
          Logger.info(`[Room: ${rid}] Room upgraded to Premium.`);
          currentState.isPremium = true;
        }
      } catch (e) {
        Logger.error('Failed to check premium status:', e);
      }
      break;

    default:
      Logger.warn(`Unknown clientAction type: ${(action as any).type}`);
      return;
  }

  // Sync state after update
  roomState[rid] = currentState;
  io.to(rid).emit('serverUpdateState', currentState);
};