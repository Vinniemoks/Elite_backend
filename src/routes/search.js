const express = require('express');
const searchService = require('../services/searchService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, ...filters } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const results = await searchService.globalSearch(q, filters);

    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
