import express from "express";
import channel from './channel';

const router = express.Router();

router.use('/', channel);

export default router;