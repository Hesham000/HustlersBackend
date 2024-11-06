const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationOtp, generateOtp, verifyOtp } = require('../services/emailService');
const blacklist = require('../utils/blacklist');
const cloudinary = require('../utils/cloudinaryConfig');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth2 client
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL}/api/auth/google/callback`
  );

// Helper function to generate JWT token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT Secret is not defined');
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register User (Email/Password)
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          error: 'This email is already in use and verified. Please log in.',
        });
      } else {
        const newOtp = generateOtp();
        existingUser.verificationOtp = newOtp;
        existingUser.verificationExpires = Date.now() + 10 * 60 * 1000;
        await existingUser.save();

        await sendVerificationOtp(email, newOtp);
        return res.status(200).json({
          success: true,
          message: 'This email is already registered but not verified. A new OTP has been sent to verify your account.',
        });
      }
    }

    // Image upload to Cloudinary (if file is provided)
    let imageUrl = 'default-image-url'; // Default image URL
    if (req.file) {
      // Upload file buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'user_images' },
          (error, result) => {
            if (error) {
              reject(new Error('Failed to upload image to Cloudinary'));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = result.secure_url; // Assign Cloudinary URL after upload
    }

    // Create the new user
    const otp = generateOtp();
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      image: imageUrl, // Store the Cloudinary URL
      isVerified: false,
      verificationOtp: otp,
      verificationExpires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
    });

    // Send OTP via email
    await sendVerificationOtp(email, otp);

    res.status(200).json({
      success: true,
      message: 'Registration successful. Please check your email for the OTP to verify your account.',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if OTP is valid and not expired
    const isValidOtp = verifyOtp(otp, user.verificationOtp);
    if (!isValidOtp || Date.now() > user.verificationExpires) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationOtp = undefined; // Clear OTP
    user.verificationExpires = undefined; // Clear OTP expiration
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return all the registered data with the response
    res.status(200).json({
      success: true,
      message: 'Email successfully verified. You are now logged in.',
      token: token,
      data: {
        token: token,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        image: user.image
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Login User (Email/Password)
exports.login = async (req, res) => {
  const { email, password, fcmToken } = req.body;

  try {
    // Find user by email and include the password in the query result
    const user = await User.findOne({ email }).select('+password');

    // Check if the user exists and the password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      return res.status(401).json({ success: false, error: 'Email not verified. Please verify your email.' });
    }

    // Update FCM token if provided
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Logout User
exports.logout = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(400).json({ success: false, error: 'No token provided' });
    }

    // Add token to blacklist to invalidate it
    blacklist.add(token);

    res.status(200).json({
      success: true,
      message: 'User logged out successfully. Token invalidated.',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to logout. Please try again.' });
  }
};

// Forget Password
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User with this email does not exist',
      });
    }

    // Generate OTP and update the user
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send OTP via email
    await sendVerificationOtp(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for password reset.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Something went wrong, please try again later.',
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User with this email does not exist',
      });
    }

    // Verify the OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    // Update the password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Something went wrong, please try again later.',
    });
  }
};

// Google OAuth Callback
exports.googleAuthCallback = (req, res) => {
    // The user is already authenticated via Passport.js at this point
    try {
      // Passport sets the user object in req.user
      const user = req.user;
  
      // Generate a JWT token for the authenticated user
      const token = generateToken(user);
  
      // Send token and user data in the response (for mobile app usage)
      res.status(200).json({
        success: true,
        message: 'Google authentication successful.',
        token: token,
        userData: {
          _id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Google authentication failed' });
    }
  };
  
  
