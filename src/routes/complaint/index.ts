import express from "express";
import compalint from './complaint';

const router = express.Router();

router.use('/', compalint);

export default router;