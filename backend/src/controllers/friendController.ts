import { Request, Response, NextFunction } from 'express';
import User from '@/models/User';
import { CustomError } from '@/middleware/errorHandler';

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
export const sendFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipientId } = req.body;
    const requesterId = (req as any).user.id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new CustomError('User not found', 404);
    }

    // Check if trying to friend yourself
    if (requesterId === recipientId) {
      throw new CustomError('Cannot send friend request to yourself', 400);
    }

    // Check if already friends
    const requester = await User.findById(requesterId);
    if (requester!.friends.includes(recipientId)) {
      throw new CustomError('Already friends with this user', 400);
    }

    // Check if already sent request
    if (requester!.friendRequests.sent.includes(recipientId)) {
      throw new CustomError('Friend request already sent', 400);
    }

    // Check if already received request
    if (recipient.friendRequests.received.includes(requesterId)) {
      throw new CustomError('This user has already sent you a friend request', 400);
    }

    // Check if blocked
    if (requester!.blockedUsers.includes(recipientId) || recipient.blockedUsers.includes(requesterId)) {
      throw new CustomError('Cannot send friend request to blocked user', 400);
    }

    // Add to sent requests
    await User.findByIdAndUpdate(requesterId, {
      $addToSet: { 'friendRequests.sent': recipientId }
    });

    // Add to recipient's received requests
    await User.findByIdAndUpdate(recipientId, {
      $addToSet: { 'friendRequests.received': requesterId }
    });

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept friend request
// @route   PUT /api/friends/accept/:userId
// @access  Private
export const acceptFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new CustomError('User not found', 404);
    }

    // Check if request exists
    if (!currentUser.friendRequests.received.includes(userId)) {
      throw new CustomError('No friend request found from this user', 404);
    }

    // Remove from received requests
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { 'friendRequests.received': userId }
    });

    // Remove from sender's sent requests
    await User.findByIdAndUpdate(userId, {
      $pull: { 'friendRequests.sent': currentUserId }
    });

    // Add to friends list for both users
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: currentUserId }
    });

    res.status(200).json({
      success: true,
      message: 'Friend request accepted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline friend request
// @route   PUT /api/friends/decline/:userId
// @access  Private
export const declineFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new CustomError('User not found', 404);
    }

    // Check if request exists
    if (!currentUser.friendRequests.received.includes(userId)) {
      throw new CustomError('No friend request found from this user', 404);
    }

    // Remove from received requests
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { 'friendRequests.received': userId }
    });

    // Remove from sender's sent requests
    await User.findByIdAndUpdate(userId, {
      $pull: { 'friendRequests.sent': currentUserId }
    });

    res.status(200).json({
      success: true,
      message: 'Friend request declined successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).populate('friends', 'name email avatar');

    res.status(200).json({
      success: true,
      count: user!.friends.length,
      data: user!.friends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/pending
// @access  Private
export const getPendingRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).populate('friendRequests.received', 'name email avatar');

    res.status(200).json({
      success: true,
      count: user!.friendRequests.received.length,
      data: user!.friendRequests.received
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent friend requests
// @route   GET /api/friends/sent
// @access  Private
export const getSentRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).populate('friendRequests.sent', 'name email avatar');

    res.status(200).json({
      success: true,
      count: user!.friendRequests.sent.length,
      data: user!.friendRequests.sent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:userId
// @access  Private
export const removeFriend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new CustomError('User not found', 404);
    }

    // Check if friends
    if (!currentUser.friends.includes(userId)) {
      throw new CustomError('Not friends with this user', 404);
    }

    // Remove from both users' friends lists
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: currentUserId }
    });

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block user
// @route   PUT /api/friends/block/:userId
// @access  Private
export const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new CustomError('User not found', 404);
    }

    // Check if trying to block yourself
    if (currentUserId === userId) {
      throw new CustomError('Cannot block yourself', 400);
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new CustomError('User not found', 404);
    }

    // Remove from friends if they are friends
    if (currentUser.friends.includes(userId)) {
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { friends: userId }
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { friends: currentUserId }
      });
    }

    // Remove from friend requests if any exist
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { 
        'friendRequests.sent': userId,
        'friendRequests.received': userId
      }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { 
        'friendRequests.sent': currentUserId,
        'friendRequests.received': currentUserId
      }
    });

    // Add to blocked users
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: userId }
    });

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock user
// @route   PUT /api/friends/unblock/:userId
// @access  Private
export const unblockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new CustomError('User not found', 404);
    }

    // Check if user is blocked
    if (!currentUser.blockedUsers.includes(userId)) {
      throw new CustomError('User is not blocked', 404);
    }

    // Remove from blocked users
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: userId }
    });

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};
