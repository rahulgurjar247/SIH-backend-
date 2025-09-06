import User from '../../models/User.js';

export const verifyAccount = async (req, res) => {
  try {
    const { email, verificationToken } = req.body;

    if (!email || !verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification token are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified'
      });
    }

    // For now, just mark as verified (in real app, validate token)
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Account verified successfully'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};
