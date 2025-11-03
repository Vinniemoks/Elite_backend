const socketIo = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const { prisma } = require('../config/database');

// Connected users map: userId -> socket.id
const connectedUsers = new Map();

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }
      
      const decoded = await verifyToken(token);
      
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Attach user to socket
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    
    // Add user to connected users
    connectedUsers.set(userId, socket.id);
    
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
    
    // Join user to their personal room
    socket.join(`user:${userId}`);
    
    // Handle private message
    socket.on('private-message', async (data) => {
      try {
        const { recipientId, content } = data;
        
        if (!recipientId || !content) {
          socket.emit('error', { message: 'Recipient ID and content are required' });
          return;
        }
        
        // Create message in database
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            recipientId,
            content,
            status: connectedUsers.has(recipientId) ? 'DELIVERED' : 'SENT'
          },
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        });
        
        // Emit to sender
        socket.emit('message-sent', message);
        
        // Emit to recipient if online
        if (connectedUsers.has(recipientId)) {
          io.to(`user:${recipientId}`).emit('new-message', message);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { recipientId, isTyping } = data;
      
      if (connectedUsers.has(recipientId)) {
        io.to(`user:${recipientId}`).emit('user-typing', {
          userId,
          isTyping
        });
      }
    });
    
    // Handle read receipts
    socket.on('mark-as-read', async (data) => {
      try {
        const { messageId } = data;
        
        // Update message status
        const message = await prisma.message.update({
          where: { id: messageId },
          data: { status: 'READ' }
        });
        
        // Notify sender if online
        if (connectedUsers.has(message.senderId)) {
          io.to(`user:${message.senderId}`).emit('message-read', {
            messageId,
            readAt: message.updatedAt
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      connectedUsers.delete(userId);
    });
  });

  return io;
};

module.exports = { initializeSocket };