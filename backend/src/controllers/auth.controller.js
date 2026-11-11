import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if ('passwordHash' in (req.body || {})) {
      return res.status(400).json({
        success: false,
        message: 'passwordHash must not be provided',
      });
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and password are required and must be strings',
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        wallet: {
          create: {
            cash: '100000.00',
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        wallet: {
          select: {
            id: true,
            cash: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        wallet: user.wallet
          ? {
              id: user.wallet.id,
              cash:
                typeof user.wallet.cash?.toFixed === 'function'
                  ? user.wallet.cash.toFixed(2)
                  : Number(user.wallet.cash).toFixed(2),
            }
          : null,
      },
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password cannot be empty',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        wallet: {
          select: {
            id: true,
            cash: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        wallet: user.wallet
          ? {
              id: user.wallet.id,
              cash:
                typeof user.wallet.cash?.toFixed === 'function'
                  ? user.wallet.cash.toFixed(2)
                  : Number(user.wallet.cash).toFixed(2),
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred fetching user details',
    });
  }
};
