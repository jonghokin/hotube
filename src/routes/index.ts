import express from 'express';
import token from './token/index';

const router = express.Router();

router.use('/token', token);

export default router;
