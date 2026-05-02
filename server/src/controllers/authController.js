import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { blacklistToken, cacheGet, cacheSet, cacheDel } from '../config/redis.js';

const userProfileKey = (userId) => `user:profile:${userId}`;

const generateTokens = (user) => {
  // jti (JWT ID) = unique ID per token, used for blacklisting on logout
  const jti = uuidv4();
  const payload = { userId: user._id, role: user.role, name: user.name, jti };
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
    const trimmedEmail = email.trim();
    const user = await User.findOne({ email: trimmedEmail });
    
    if (!user) {
      console.log('Login failed: User not found for email:', trimmedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    setTokenCookie(res, refreshToken);

    res.json({ token: accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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

export const logout = async (req, res) => {
  try {
    // Blacklist the current access token in Redis
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded?.jti && decoded?.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) await blacklistToken(decoded.jti, ttl);
        }
      } catch (_) { /* ignore decode errors */ }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;
    
    // Safety: prevent password and email changes through this endpoint
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');

    // Invalidate cached profile so next getMe fetches fresh data
    await cacheDel(userProfileKey(userId));

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cKey = userProfileKey(userId);

    // Try cache first
    const cached = await cacheGet(cKey);
    if (cached) {
      console.log(`[Cache] HIT: ${cKey}`);
      return res.json(cached);
    }

    // Cache MISS → DB
    console.log(`[Cache] MISS: ${cKey}`);
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cache profile for 5 minutes
    await cacheSet(cKey, user, 300);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const invalidateUserCache = async (userId) => {
  await cacheDel(userProfileKey(userId));
};
