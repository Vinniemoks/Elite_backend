const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

let io;

/**
 * Initialize Socket.IO
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          userType: true
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join user's personal room
    socket.join(socket.user.id);

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content } = data;

        // Save message to database
        const message = await prisma.message.create({
          data: {
            senderId: socket.user.id,
            recipientId,
            content,
            status: 'SENT'
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        });

        // Send to recipient if online
        io.to(recipientId).emit('new_message', message);

        // Confirm to sender
        socket.emit('message_sent', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { recipientId } = data;
      io.to(recipientId).emit('user_typing', {
        userId: socket.user.id,
        firstName: socket.user.firstName
      });
    });

    // Handle stop typing
    socket.on('stop_typing', (data) => {
      const { recipientId } = data;
      io.to(recipientId).emit('user_stop_typing', {
        userId: socket.user.id
      });
    });

    // Handle message read
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;

        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'READ' }
        });

        // Notify sender
        const message = await prisma.message.findUnique({
          where: { id: messageId }
        });

        if (message) {
          io.to(message.senderId).emit('message_read', { messageId });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit notification to specific user
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser
};
