import express from "express";
import token from './token';

const router = express.Router();

router.use('/', token);

export default router;