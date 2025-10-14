import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
  blockUser,
  unblockUser
} from '@/controllers/friendController';
import authenticate from '../middleware/auth';

const router = Router();

// @route   POST /api/friends/request
// @desc    Send friend request
// @access  Private
router.post('/request', authenticate, [
  body('recipientId').isMongoId().withMessage('Please provide a valid user ID')
], sendFriendRequest);

// @route   PUT /api/friends/accept/:userId
// @desc    Accept friend request
// @access  Private
router.put('/accept/:userId', authenticate, [
  param('userId').isMongoId().withMessage('Please provide a valid user ID')
], acceptFriendRequest);

// @route   PUT /api/friends/decline/:userId
// @desc    Decline friend request
// @access  Private
router.put('/decline/:userId', authenticate, [
  param('userId').isMongoId().withMessage('Please provide a valid user ID')
], declineFriendRequest);

// @route   GET /api/friends
// @desc    Get all friends
// @access  Private
router.get('/', authenticate, getFriends);

// @route   GET /api/friends/pending
// @desc    Get pending friend requests
// @access  Private
router.get('/pending', authenticate, getPendingRequests);

// @route   GET /api/friends/sent
// @desc    Get sent friend requests
// @access  Private
router.get('/sent', authenticate, getSentRequests);

// @route   DELETE /api/friends/:userId
// @desc    Remove friend
// @access  Private
router.delete('/:userId', authenticate, [
  param('userId').isMongoId().withMessage('Please provide a valid user ID')
], removeFriend);

// @route   PUT /api/friends/block/:userId
// @desc    Block user
// @access  Private
router.put('/block/:userId', authenticate, [
  param('userId').isMongoId().withMessage('Please provide a valid user ID')
], blockUser);

// @route   PUT /api/friends/unblock/:userId
// @desc    Unblock user
// @access  Private
router.put('/unblock/:userId', authenticate, [
  param('userId').isMongoId().withMessage('Please provide a valid user ID')
], unblockUser);

export default router;
