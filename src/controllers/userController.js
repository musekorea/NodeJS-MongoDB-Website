import { db } from '../db.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import fetch from 'cross-fetch';

export const getJoinController = (req, res) => {
  return res.status(200).render('join.ejs');
};

const deleteAvatar = (fileURL) => {
  if (fs.existsSync(fileURL)) {
    fs.unlinkSync(fileURL);
  } else {
    return;
  }
};

export const postJoinController = async (req, res) => {
  const { email, nickname, password, password2, gender, avatar, birth } =
    req.body;
  let fileURL = '';
  if (req.file) {
    fileURL = path.resolve(__dirname, '..', '..', `${req.file.path}`);
  }
  if (password !== password2) {
    if (!fileURL) {
      deleteAvatar(fileURL);
    }
    req.flash('passwordError', 'PASSWORD ERROR');
    return res.status(400).redirect('/user/join');
  }

  const user = await db.collection('users').findOne({ email });
  if (user) {
    if (!fileURL) {
      deleteAvatar(fileURL);
    }
    req.flash('emailError', `${email} ALREADY EXISTS`);
    return res.status(400).redirect('/user/join');
  }

  const nicknameCheck = await db.collection('users').findOne({ nickname });
  if (nicknameCheck) {
    if (!fileURL) {
      deleteAvatar(fileURL);
    }
    req.flash('nickNameError', `${nickname}  ALREADY EXISTS`);
    return res.status(400).redirect('/user/join');
  }
  try {
    const hashedPassword = bcrypt.hashSync(password, 5);
    let avatarURL = '';
    if (req.file) {
      avatarURL = '/' + req.file.path;
    }
    const createUser = await db.collection('users').insertOne({
      email,
      nickname,
      password: hashedPassword,
      gender,
      avatarURL,
      birth,
      socialOnly: false,
    });
    return res.status(300).redirect('/user/login');
  } catch (error) {
    console.log(error);
  }
};

export const getLoginController = (req, res) => {
  return res.status(200).render('login.ejs');
};

export const postLoginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      req.flash('emailError', "Email doesn't exist");
      return res.status(400).redirect('/user/login');
    }

    if (user.socialOnly === true) {
      return res.status(400).render('login.ejs', {
        error: `You already have a ${user.oAuth} Account`,
      });
    }
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (checkPassword === true) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return res.status(200).redirect('/');
    } else {
      req.flash('passwordError', 'Password Error');
      return res.status(400).redirect('/user/login');
    }
  } catch (error) {
    console.log(error);
  }
};

export const getLogoutController = (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  return res.status(200).redirect('/');
};

/* =======================GITHUB LOGIN====================== */

export const githubStartController = (req, res) => {
  const baseURL = `https://github.com/login/oauth/authorize?`;
  const config = {
    client_id: process.env.GITHUB_ID,
    scope: 'read:user user:email',
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  res.redirect(finalURL);
};

export const githubFinishController = async (req, res) => {
  const code = req.query.code;
  const baseURL = `https://github.com/login/oauth/access_token?`;
  const config = {
    client_id: process.env.GITHUB_ID,
    client_secret: process.env.GITHUB_SECRET,
    code,
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  try {
    const tokenFetch = await fetch(finalURL, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    const tokenJSON = await tokenFetch.json();
    const token = tokenJSON.access_token;
    if (tokenJSON) {
      const userFetch = await fetch(`https://api.github.com/user`, {
        method: 'GET',
        headers: {
          Authorization: `token ${token}`,
        },
      });
      const userJSON = await userFetch.json();
      const emailFetch = await fetch('https://api.github.com/user/emails', {
        method: 'get',
        headers: {
          Authorization: `token ${token}`,
        },
      });
      const emailJSON = await emailFetch.json();
      const email = emailJSON.find((item) => {
        return item.primary === true && item.verified === true;
      }).email;
      const localUser = await db.collection('users').findOne({ email });
      if (localUser) {
        if (!localUser.avatar) {
          const updateAvatar = await db.collection('users').updateOne(
            { email },
            {
              $set: { avatarURL: userJSON.avatar_url },
            }
          );
        }
        req.session.isLoggedIn = true;
        req.session.user = localUser;
        return res.status(300).redirect('/');
      } else {
        try {
          const addUser = await db.collection('users').insertOne({
            email,
            nickname: userJSON.company ? userJSON.name : email.split('@')[0],
            password: '',
            gender: '',
            avatarURL: userJSON.avatar_url,
            birth: '',
            socialOnly: true,
            oAuth: 'Github',
          });
          const user = await db.collection('users').findOne({ email });
          req.session.isLoggedIn = true;
          req.session.user = user;
          return res.status(300).redirect('/');
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

/* ====================GOOGLE LOGIN============== */
export const googleStartController = (req, res) => {
  const baseURL = `https://accounts.google.com/o/oauth2/v2/auth?`;
  const config = {
    client_id: process.env.GOOGLE_ID,
    redirect_uri: `http://localhost:8080/user/google/callback`,
    response_type: 'code',
    scope: `openid email profile`,
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  res.redirect(finalURL);
};

export const googleFinishController = async (req, res) => {
  const code = req.query.code;
  const baseURL = `https://oauth2.googleapis.com/token?`;
  const config = {
    client_id: process.env.GOOGLE_ID,
    client_secret: process.env.GOOGLE_SECRET,
    code,
    redirect_uri: `http://localhost:8080/user/google/callback`,
    grant_type: 'authorization_code',
  };
  const query = new URLSearchParams(config).toString();
  const finalURL = baseURL + query;
  try {
    const requestToken = await fetch(finalURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const tokenJSON = await requestToken.json();
    if (tokenJSON) {
      const requsetUser = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${tokenJSON.access_token}`,
          },
        }
      );
      const userJSON = await requsetUser.json();
      try {
        const localUser = await db
          .collection('users')
          .findOne({ email: userJSON.email });
        if (localUser) {
          req.session.isLoggedIn = true;
          req.session.user = localUser;
          return res.status(300).redirect('/');
        } else {
          const addUser = await db.collection('users').insertOne({
            email: userJSON.email,
            nickname: userJSON.name,
            password: '',
            gender: '',
            avatarURL: userJSON.picture,
            birth: '',
            socialOnly: true,
            oAuth: 'Google',
          });
          req.session.isLoggedIn = true;
          req.session.user = await db
            .collection('users')
            .findOne({ email: userJSON.email });
        }
        return res.status(300).redirect('/');
      } catch (error) {
        console.log(error);
      }
    } else {
      /* tokenJSON bu zai */
    }
  } catch (error) {
    console.log(error);
  }
};

/* USER PROFILE */
export const getProfileController = async (req, res) => {
  const owner = req.params.owner;
  let publicUser;
  try {
    if (req.session.isLoggedIn === true) {
      if (req.session.user.nickname === owner) {
        return res.status(200).render('profile.ejs');
      } else {
        publicUser = await db.collection('users').findOne({ nickname: owner });
        return res.status(200).render('publicUserProfile.ejs', { publicUser });
      }
    } else {
      publicUser = await db.collection('users').findOne({ nickname: owner });
      return res.status(200).render('publicUserProfile.ejs', { publicUser });
    }
  } catch (error) {
    console.log(error);
  }
};

/* EDIT USER PROFILE */
export const getEditProfileController = (req, res) => {
  return res.status(200).render('editProfile.ejs');
};

export const postEditProfileController = async (req, res) => {
  try {
    const currentPassword = req.body.password;
    const currentUser = await db
      .collection('users')
      .findOne({ email: req.session.user.email });
    const hashedPassword = currentUser.password;
    const checkPassword = bcrypt.compareSync(currentPassword, hashedPassword);
    if (!checkPassword) {
      req.flash('passwordError', 'Pawssword Error');
      return res.status(400).redirect('/user/editProfile');
    }
  } catch (error) {
    console.log(error);
  }

  let fileURL;
  if (req.file) {
    fileURL = path.resolve(__dirname, '..', '..', `${req.file.path}`);
  }
  let avatar = '';
  if (!req.file && !req.session.user.avatarURL) {
    avatar = '';
  } else if (!req.file && req.session.user.avatarURL) {
    avatar = req.session.user.avatarURL;
  } else if (req.file) {
    avatar = '/' + req.file.path;
  }
  let { email, nickname, gender, birth } = req.body;
  if (
    email === req.session.user.email &&
    nickname === req.session.user.nickname
  ) {
    try {
      const updateProfile = await db.collection('users').updateOne(
        { email: req.session.user.email },
        {
          $set: {
            email: email,
            nickname: nickname,
            gender,
            birth,
            avatarURL: avatar,
          },
        }
      );
      const findCommunity = await db
        .collection('community')
        .find({ owner: nickname })
        .toArray();
      findCommunity.forEach(async (community) => {
        const updateCommunity = await db.collection('community').updateOne(
          { _id: Number(community._id) },
          {
            $set: {
              avatarURL: avatar,
            },
          }
        );
      });
      const findComments = await db
        .collection('comments')
        .find({ nickname })
        .toArray();
      findComments.forEach(async (comment) => {
        const updateComment = await db.collection('comments').updateOne(
          {
            _id: comment._id,
          },
          {
            $set: {
              avatarURL: avatar,
            },
          }
        );
      });

      if (req.file && req.session.user.avatarURL) {
        /* delete */
        const imgURL = path.resolve(
          __dirname,
          '..',
          '..',
          `${req.session.user.avatarURL.substring(1)}`
        );
        deleteAvatar(imgURL);
      }
      req.session.user = await db.collection('users').findOne({ email });
      return res
        .status(300)
        .redirect(`/user/profile/${req.session.user.nickname}`);
    } catch (error) {
      console.log(error);
    }
  }

  try {
    const checkEmail = await db.collection('users').findOne({ email });
    const checkNickname = await db.collection('users').findOne({ nickname });
    if (email !== req.session.user.email && checkEmail) {
      req.flash('emailError', 'EMAIL ALREADY EXISTS');
      return res.status(300).redirect('/user/editProfile');
    } else if (email === req.session.user.nickname) {
      email = req.session.user.email;
    }
    if (nickname !== req.session.user.nickname && checkNickname) {
      req.flash('nickNameError', 'NICKNAME ALREADY EXISTS');
      return res.status(300).redirect('/user/editProfile');
    } else if (nickname === req.session.user.nickname) {
      nickname = req.session.user.nickname;
    }
    const updateProfile = await db.collection('users').updateOne(
      { email: req.session.user.email },
      {
        $set: {
          email: email,
          nickname: nickname,
          gender,
          birth,
          avatarURL: avatar,
        },
      }
    );
    if (req.file && req.session.user.avatarURL) {
      /* delete */
      const imgURL = path.resolve(
        __dirname,
        '..',
        '..',
        `${req.session.user.avatarURL.substring(1)}`
      );
      deleteAvatar(imgURL);
    }

    req.session.user = await db.collection('users').findOne({ email });

    return res
      .status(300)
      .redirect(`/user/profile/${req.session.user.nickname}`);
  } catch (error) {
    console.log(error);
  }
};

/* =============change password =================== */
export const getChangePasswordController = (req, res) => {
  return res.status(200).render('changePassword.ejs');
};

export const putChangePasswordController = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword === '') {
    try {
      await db.collection('users').updateOne(
        { email: req.session.user.email },
        {
          $set: {
            password: bcrypt.hashSync(newPassword, 5),
            socialOnly: false,
          },
        }
      );
      req.session.user.socialOnly = false;
      req.flash('message', 'Password Update Success');
      return res.status(200).end();
    } catch (error) {
      console.log(error);
    }
  }
  try {
    const user = await db
      .collection('users')
      .findOne({ email: req.session.user.email });
    const userPassword = user.password;
    const checkPassword = bcrypt.compareSync(currentPassword, userPassword);
    if (!checkPassword) {
      req.flash('message', 'Password Error');
      return res.status(400).end();
    }
    const updatePassword = await db.collection('users').updateOne(
      { email: req.session.user.email },
      {
        $set: {
          password: bcrypt.hashSync(newPassword, 5),
        },
      }
    );

    req.flash('message', 'Password Update Success');
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};
