import Session from '../models/Session.js';

export const startSession = async (req, res) => {
  try {
    let session = await Session.findOne({ userId: req.user.userId, status: 'active' });
    if (session) {
      return res.status(400).json({ message: 'Session already active', session });
    }

    session = new Session({ userId: req.user.userId, status: 'active' });
    await session.save();
    
    res.status(201).json({ message: 'Session started', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await Session.findOne({ userId: req.user.userId, status: 'active' });
    if (!session) {
      return res.status(400).json({ message: 'No active session found' });
    }

    session.status = 'inactive';
    session.endTime = Date.now();
    await session.save();

    res.json({ message: 'Session ended', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSessionStatus = async (req, res) => {
  try {
    const session = await Session.findOne({ userId: req.user.userId, status: 'active' });
    if (session) {
      res.json({ status: 'Active', session });
    } else {
      res.json({ status: 'Inactive' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
