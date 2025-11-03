const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get user conversations
 * @route GET /api/messages/conversations
 */
exports.getConversations = async (req, res, next) => {
  try {
    // Get all unique conversations where the user is either sender or recipient
    const conversations = await prisma.$queryRaw`
      SELECT 
        DISTINCT ON (other_user_id) 
        other_user_id,
        other_user_first_name,
        other_user_last_name,
        other_user_avatar,
        message_id,
        content,
        created_at,
        status
      FROM (
        SELECT 
          m.id as message_id,
          m.content,
          m.created_at,
          m.status,
          CASE 
            WHEN m.sender_id = ${req.user.id} THEN m.recipient_id 
            ELSE m.sender_id 
          END as other_user_id,
          CASE 
            WHEN m.sender_id = ${req.user.id} THEN u.first_name 
            ELSE u.first_name 
          END as other_user_first_name,
          CASE 
            WHEN m.sender_id = ${req.user.id} THEN u.last_name 
            ELSE u.last_name 
          END as other_user_last_name,
          CASE 
            WHEN m.sender_id = ${req.user.id} THEN u.avatar 
            ELSE u.avatar 
          END as other_user_avatar
        FROM "Message" m
        JOIN "User" u ON (
          CASE 
            WHEN m.sender_id = ${req.user.id} THEN m.recipient_id = u.id
            ELSE m.sender_id = u.id
          END
        )
        WHERE m.sender_id = ${req.user.id} OR m.recipient_id = ${req.user.id}
        ORDER BY m.created_at DESC
      ) as conversations
      ORDER BY other_user_id, created_at DESC
    `;

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages between current user and another user
 * @route GET /api/messages/:userId
 */
exports.getMessageHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get messages between users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: req.user.id,
            recipientId: userId
          },
          {
            senderId: userId,
            recipientId: req.user.id
          }
        ]
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });
    
    // Mark unread messages as delivered
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        recipientId: req.user.id,
        status: 'SENT'
      },
      data: {
        status: 'DELIVERED'
      }
    });
    
    // Get total count
    const total = await prisma.message.count({
      where: {
        OR: [
          {
            senderId: req.user.id,
            recipientId: userId
          },
          {
            senderId: userId,
            recipientId: req.user.id
          }
        ]
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message (non-socket alternative)
 * @route POST /api/messages
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    
    if (!recipientId || !content) {
      return next(new AppError('Recipient ID and content are required', 400));
    }
    
    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    });
    
    if (!recipient) {
      return next(new AppError('Recipient not found', 404));
    }
    
    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        recipientId,
        content,
        status: 'SENT'
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
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};