import express from 'express';
import { getAllContent, getContentById } from '../controllers/contentController.js';

const router = express.Router();

router.get('/list', getAllContent);
router.get('/:id', getContentById);

export default router;
