const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Conversation  = require("../model/message");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const message = require("../model/message");
const nodemailer  = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

const transporter  = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS,
  }
})

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({email});

    if (existingUser) {
      return res.status(400).json({ message: "Email username already exists" });
    }

    const hashedPassword  = await bcrypt.hash(password,10);

    const newUser = new User({ name, email, password:hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password){
    return res.status(400).json({message:"All fields are required"});
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid eamil and password" });
    }

    const ok = await bcrypt.compare(password , user.password);
    if(!ok)return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({
      message: "Login successful",
      userdata: {
        name: user.name,
        id: user._id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/forgot-password',async  (req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email});

  if(!user) return res.status(400).json({message:"User not found"});

  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp =OTP;
  await user.save();

  await transporter.sendMail({
    from:process.env.EMAIL_USER,
    to:email,
    subject: "Password Reset OTP",
    text: `Your OTP is ${OTP}`
  })

  res.json({message:"OTP sent to email"});
});

router.post('/reset-password', async (req,res)=>{
  const {email,otp,newPassword} = req.body;

  const user = await User.findOne({email});

  if(!user) return res.status(400).json({message:'user not found'});

  if(user.otp != otp || Date.now() > user.otpExpiry){
    return res.status(400).json({message:"opt expired or Invalid"});
  }

  user.password = await bcrypt.hash(newPassword,10);
  user.otp = undefined;
  user.otpExpiry= undefined;

  await user.save();
  res.json({ message: "Password reset successful" });
})

router.get("/all-user", async (req, res) => {
  try {
    const user = await User.find();
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: "No user found" });
  }
});

router.get("/get-friend/:userID" , async (req,res)=>{
  try{
    const user  = await User.findById(req.params.userID).populate('friends','name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.friends);
  }catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})

router.post("/add-friend", async (req, res) => {
  const { currentUserId, friendUserId } = req.body;

  if (!currentUserId || !friendUserId) {
    return res.status(300).json({ message: "Missing ids" });
  }
  try {
    const updateUser = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { friends: friendUserId } },
      { new: true }
    ).populate("friends", "name");
    res.json(updateUser);
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// routes/friend.js
router.delete("/remove-friend", async (req, res) => {
  const { currentUserId, friendUserId } = req.body;

  if (!currentUserId || !friendUserId) {
    return res.status(400).json({ message: "Missing IDs" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { friends: friendUserId } },
      { new: true }
    ).populate("friends", "name");

    res.json(updatedUser);
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/save-message", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // Create new conversation if not exists
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [{ sender: senderId, content: message }],
      });
    } else {
      // Push new message
      conversation.messages.push({ sender: senderId, content: message });
    }

    await conversation.save();

    return res.status(201).json({ success: true, conversation });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save message" });
  }
});




router.get("/get-conversation/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    }).populate("messages.sender", "name");

    if (!conversation) return res.status(404).json({ messages: [] });

    res.json(conversation.messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

module.exports = router;
