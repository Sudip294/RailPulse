const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:contact@railpulse.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription object" });
    }

    // Check if it already exists to avoid duplicates
    let existingSub = await PushSubscription.findOne({ 'subscription.endpoint': subscription.endpoint });
    
    if (existingSub) {
      // Update userId just in case they logged in with a different account on the same browser
      existingSub.userId = req.userId;
      await existingSub.save();
    } else {
      await PushSubscription.create({
        userId: req.userId,
        subscription
      });
    }

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Push subscribe error:", error);
    res.status(500).json({ message: "Failed to save subscription" });
  }
};

exports.getPublicKey = (req, res) => {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: "No endpoint provided" });

    await PushSubscription.deleteOne({ 'subscription.endpoint': endpoint });
    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
};
