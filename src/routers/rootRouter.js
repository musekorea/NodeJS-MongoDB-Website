import express from 'express';
import { homeController } from '../controllers/rootController';

export const rootRouter = express.Router();

rootRouter.get('/', homeController);
