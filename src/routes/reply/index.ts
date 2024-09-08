import express from "express";
import reply from './reply';

const router = express.Router();

router.use('/', reply);

export default router;