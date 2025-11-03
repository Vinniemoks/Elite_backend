const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const uploadService = require('../services/uploadService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const url = await uploadService.uploadImage(req.file);

    res.status(200).json({
      status: 'success',
      data: { url }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/video', upload.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const url = await uploadService.uploadVideo(req.file);

    res.status(200).json({
      status: 'success',
      data: { url }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/document', upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const url = await uploadService.uploadDocument(req.file);

    res.status(200).json({
      status: 'success',
      data: { url }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
