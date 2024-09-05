import express from 'express';
import token from './token/index';
import user from './user/index';
import email from './email/index';

const router = express.Router();

router.use('/token', token);
router.use('/user', user);
router.use('/email', email);

export default router;
