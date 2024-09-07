import express from "express";
import recommend from './recommend';

const router = express.Router();

router.use('/', recommend);

export default router;