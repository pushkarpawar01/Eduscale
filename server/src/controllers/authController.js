import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateTokens = (user) => {
  const payload = { userId: user._id, role: user.role, name: user.name };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, mobile, college, degree, skills, interests } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, email, password: hashedPassword,
      mobile, college, degree, skills, interests
    });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    setTokenCookie(res, refreshToken);

    res.status(201).json({ 
      token: accessToken, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    setTokenCookie(res, refreshToken);

    res.json({ token: accessToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret');
    const payload = { userId: decoded.userId, role: decoded.role, name: decoded.name };
    
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '15m' });
    
    res.json({ token: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};
