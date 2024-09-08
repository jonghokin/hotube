import express from 'express';
import complaint from './complaint/index';
import content from './content/index';
import email from './email/index';
import home from './home/index';
import recommend from './recommend/index';
import reply from './reply/index';
import token from './token/index';
import user from './user/index';

const router = express.Router();

router.use('/token', token);
router.use('/user', user);
router.use('/email', email);
router.use('/home', home);
router.use('/content', content);
router.use('/recommend', recommend);
router.use('/complaint', complaint);
router.use('/reply', reply);

export default router;
