const Report = require('../models/Report');
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

// Config Web Push (Make sure this runs using the ENV vars)
// We wrap it in a try-catch for safety if keys are missing
try {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:contact@railpulse.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch (e) {
  console.log('Web push not fully configured yet');
}

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'name profileImg');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports" });
  }
};

const createReport = (io) => async (req, res) => {
  try {
    const { station, line, issue, details } = req.body;
    const newReport = await Report.create({
      station,
      line,
      issue,
      details: details || "",
      userId: req.userId,
    });
    
    const populatedReport = await newReport.populate('userId', 'name profileImg');
    
    // Broadcast to all users via WebSockets
    io.emit('newReport', populatedReport);

    // ==========================================
    // Web Push Notifications
    // ==========================================
    try {
      const payload = JSON.stringify({
        title: `🚨 Train Alert: ${station}`,
        body: `${issue === 'heavy_crowd' ? 'Heavy Crowd' : issue === 'delay' ? 'Delayed Train' : issue === 'cancelled' ? 'Train Cancelled' : 'Other Issue'} reported on ${line} line.`,
        url: '/'
      });

      // Get all subscriptions except the sender
      const allSubscriptions = await PushSubscription.find({ userId: { $ne: req.userId } });

      const pushPromises = allSubscriptions.map(sub => 
        webpush.sendNotification(sub.subscription, payload)
          .catch(err => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              // Subscription has expired or is no longer valid, delete it
              return PushSubscription.findByIdAndDelete(sub._id);
            }
          })
      );

      // We don't await because we don't want to slow down the API response
      Promise.all(pushPromises).catch(console.error);

    } catch (pushErr) {
      console.error("Push Notification error:", pushErr);
    }
    // ==========================================
    
    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(500).json({ message: "Error creating report" });
  }
};


const upvoteReport = (io) => async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.verifiedBy.includes(req.userId)) {
      // Retreat (Undo) Verification
      report.verifiedBy = report.verifiedBy.filter(userId => userId.toString() !== req.userId);
      report.upvotes = Math.max(0, report.upvotes - 1);
    } else {
      // Retreat Fake if exists
      if (report.fakedBy.includes(req.userId)) {
        report.fakedBy = report.fakedBy.filter(userId => userId.toString() !== req.userId);
        report.fakeVotes = Math.max(0, report.fakeVotes - 1);
      }
      // Add Verification
      report.verifiedBy.push(req.userId);
      report.upvotes += 1;
    }

    await report.save();

    // Broadcast both upvote and fake update just in case it toggled
    io.emit('updateUpvote', { id, upvotes: report.upvotes });
    io.emit('updateFake', { id, fakeVotes: report.fakeVotes });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error upvoting report" });
  }
};

const fakeReport = (io) => async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.fakedBy.includes(req.userId)) {
      // Retreat (Undo) Fake
      report.fakedBy = report.fakedBy.filter(userId => userId.toString() !== req.userId);
      report.fakeVotes = Math.max(0, report.fakeVotes - 1);
    } else {
      // Retreat Verify if exists
      if (report.verifiedBy.includes(req.userId)) {
        report.verifiedBy = report.verifiedBy.filter(userId => userId.toString() !== req.userId);
        report.upvotes = Math.max(0, report.upvotes - 1);
      }
      // Add Fake
      report.fakedBy.push(req.userId);
      report.fakeVotes += 1;
    }

    await report.save();

    // Broadcast both upvote and fake update just in case it toggled
    io.emit('updateFake', { id, fakeVotes: report.fakeVotes });
    io.emit('updateUpvote', { id, upvotes: report.upvotes });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error updating fake vote" });
  }
};

const updateReportMessage = (io) => async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Only the author can update this message." });
    }

    report.message = message;
    await report.save();

    io.emit('updateMessage', { id, message: report.message });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error updating message" });
  }
};

const deleteReport = (io) => async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Only the author can delete this post." });
    }

    await report.deleteOne();

    io.emit('reportDeleted', { id });

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report" });
  }
};

module.exports = { getReports, createReport, upvoteReport, fakeReport, updateReportMessage, deleteReport };
