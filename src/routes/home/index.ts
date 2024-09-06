import express from "express";
import home from './home';

const router = express.Router();

router.use('/', home);

export default router;