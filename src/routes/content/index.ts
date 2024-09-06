import express from "express";
import content from './content';

const router = express.Router();

router.use('/', content);

export default router;