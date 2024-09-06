import express from 'express';
import token from './token/index';
import user from './user/index';
import email from './email/index';
import home from './home/index';
import content from './content/index';

const router = express.Router();

router.use('/token', token);
router.use('/user', user);
router.use('/email', email);
router.use('/home', home);
router.use('/content', content);

export default router;
