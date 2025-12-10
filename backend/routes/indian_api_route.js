import express from 'express';
import { fetch52WeekHighLowData } from '../controllers/indian_api_controller.js';

const router = express.Router();

router.get('/fetch_52_week_high_low_data', fetch52WeekHighLowData);

export default router;