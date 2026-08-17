import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import User from '../Modals/Auth.js';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to send confirmation email
async function sendConfirmationEmail(userEmail, planType) {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"YouTube Clone Support" <${process.env.EMAIL_USER}>`, 
      to: userEmail,
      subject: "Subscription Upgrade Confirmation", 
      text: `Hello,\n\nThank you for upgrading to the ${planType} plan! Your payment was successful.\n\nEnjoy your new features.\n\nBest,\nYouTube Clone Team`, 
      html: `<b>Hello,</b><br><br>Thank you for upgrading to the <b>${planType}</b> plan! Your payment was successful.<br><br>Enjoy your new features.<br><br>Best,<br>YouTube Clone Team`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export const createOrder = async (req, res) => {
  const { userId, planType } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.plan === planType) {
      return res.status(400).json({ message: `User is already on the ${planType} plan` });
    }

    let unit_amount = 0;
    if (planType === "Bronze") unit_amount = 500 * 100; // $5 -> 500 INR in paise for test (or any currency)
    else if (planType === "Silver") unit_amount = 1000 * 100; // $10
    else if (planType === "Gold") unit_amount = 2000 * 100; // $20
    else {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const options = {
      amount: unit_amount, 
      currency: "INR", // Using INR for Razorpay typical test
      receipt: `receipt_${userId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planType } = req.body;

  try {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      const updatedUser = await User.findByIdAndUpdate(userId, { plan: planType }, { new: true });
      console.log(`Successfully upgraded user ${userId} to ${planType}.`);
      
      // Send confirmation email asynchronously
      if (updatedUser && updatedUser.email) {
        sendConfirmationEmail(updatedUser.email, planType);
      }

      return res.status(200).json({ message: "Payment verified successfully", user: updatedUser });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
