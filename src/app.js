import express from 'express';
import { rootRouter } from './routers/rootRouter';
import { communityRouter } from './routers/communityRouter';
import { userRouter } from './routers/userRouter';
import { resLocals } from './middleware/middleware';
import session from 'express-session';
import flash from 'express-flash';

export const app = express();

app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(resLocals);

app.use('/', rootRouter);
app.use('/community', communityRouter);
app.use('/user', userRouter);
