import express from 'express';
export const userRouter = express.Router();
import {
  multerUpload,
  loginOnly,
  logoutOnly,
} from '../middleware/middleware.js';
import {
  getJoinController,
  postJoinController,
  getLoginController,
  postLoginController,
  getLogoutController,
  githubStartController,
  githubFinishController,
  googleStartController,
  googleFinishController,
  getProfileController,
  getEditProfileController,
  postEditProfileController,
  getChangePasswordController,
  putChangePasswordController,
} from '../controllers/userController.js';

const avatarUpload = multerUpload.single('avatar');

userRouter.get('/join', logoutOnly, getJoinController);
userRouter.post('/join', logoutOnly, avatarUpload, postJoinController);
userRouter.get('/login', logoutOnly, getLoginController);
userRouter.post('/login', logoutOnly, postLoginController);
userRouter.get('/logout', loginOnly, getLogoutController);
userRouter.get('/github/start', githubStartController);
userRouter.get('/github/callback', githubFinishController);
userRouter.get('/google/start', googleStartController);
userRouter.get('/google/callback', googleFinishController);
userRouter.get('/profile/:owner', getProfileController);
userRouter
  .route('/editProfile')
  .get(loginOnly, getEditProfileController)
  .post(loginOnly, avatarUpload, postEditProfileController);
userRouter.get('/changePassword', loginOnly, getChangePasswordController);
userRouter.put('/changePassword', loginOnly, putChangePasswordController);
