import multer from 'multer';
export const multerUpload = multer({ dest: 'uploads/' });

export const resLocals = (req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session.isLoggedIn);
  if (req.session.user) {
    res.locals.user = req.session.user;
    res.locals.user.password = '';
  } else {
    res.locals.user = '';
  }

  next();
};

export const loginOnly = (req, res, next) => {
  if (req.session.isLoggedIn === true) {
    return next();
  } else {
    return res.status(300).redirect('/');
  }
};

export const logoutOnly = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return next();
  } else {
    return res.status(300).redirect('/');
  }
};
