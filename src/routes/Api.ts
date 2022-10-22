// Dependencies
import { Router } from 'express';

// Controllers
import TestController from '../controllers/test-controller';
// Auth
import SignUp from '../controllers/authentication/signup';
import Login from '../controllers/authentication/login';
// App
import GetFriendRequests from '../controllers/application/get-friend-requests';
import GetFriends from '../controllers/application/get-friends';
import GetFriendsMessages from '../controllers/application/get-friends-messages';
import GetUserData from '../controllers/application/get-userdata';
import SendFriendRequest from '../controllers/application/send-friend-request';
import RemoveFriend from '../controllers/application/remove-friend';
import AcceptFriendRequest from '../controllers/application/accept-friend-request';
// Services
import CheckForUpdates from "../controllers/services/updates/check-for-updates";
// Webhooks
import UpdateWebhook from "../controllers/services/updates/update_webhook";
// Debug
import Friends from '../controllers/debug/friends';

const router = Router();

router.post('/test', TestController.perform);
// Auth
router.post('/auth/signup', SignUp.perform);
router.post('/auth/login', Login.perform);
// App
router.post('/app/send-friend-request', SendFriendRequest.perform);
router.post('/app/get-friends', GetFriends.perform);
router.post('/app/get-userdata', GetUserData.perform);
router.post('/app/get-friends-messages', GetFriendsMessages.perform);
router.post('/app/get-friend-requests', GetFriendRequests.perform);
router.post('/app/remove-friend', RemoveFriend.perform);
router.post('/app/accept-friend-request', AcceptFriendRequest.perform);
// Services
router.post('/services/check-for-updates', CheckForUpdates.perform)
// Webhooks
router.post('/webhooks/update', UpdateWebhook.perform)
// Debug
router.post('/debug/friends', Friends.perform);

export default router;
