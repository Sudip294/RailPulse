const express = require('express');
const { getReports, createReport, upvoteReport, fakeReport, updateReportMessage, deleteReport } = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');

const router = (io) => {
  const expressRouter = express.Router();
  
  expressRouter.get('/', getReports);
  expressRouter.post('/', auth, createReport(io));
  expressRouter.patch('/:id/upvote', auth, upvoteReport(io));
  expressRouter.patch('/:id/fake', auth, fakeReport(io));
  expressRouter.patch('/:id/message', auth, updateReportMessage(io));
  expressRouter.delete('/:id', auth, deleteReport(io));
  
  return expressRouter;
};

module.exports = router;
