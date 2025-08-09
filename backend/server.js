const multer = require('multer');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const Order = require('./models/Order');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Serve static HTML/CSS/JS from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static('uploads'));

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:5500', // or wherever you're serving frontend
  'https://shruti-s-website-front.vercel.app' // ✅ replace with your real Vercel URL
  credentials: true // allow cookies for session
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true if using HTTPS
}));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// ✅ File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}.${ext}`);
  }
});
const upload = multer({ storage });

// ✅ Admin Login API
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.status(200).json({ message: 'Login successful' });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

// ✅ Check Admin Auth (for frontend JS)
app.get('/api/admin/check', (req, res) => {
  if (req.session.isAdmin) {
    return res.sendStatus(200);
  }
  res.sendStatus(401);
});

// ✅ Logout Admin
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// ✅ Get All Orders
app.get('/api/orders', async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// ✅ Delete Order by ID
app.delete('/api/orders/:id', async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ error: 'Unauthorized' });
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

// ✅ Receive and Save Orders with Image Upload (no auth needed)
app.post('/api/orders', upload.single('referenceImage'), async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      referenceImageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    await newOrder.save();

    // ✅ Send email to customer
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS
  }
});

// send the email
await transporter.sendMail({
  from: `"Shruti's Art" <${process.env.SMTP_EMAIL}>`,
  to: newOrder.email,
  subject: "Thank you for your order!",
  text: `Hi ${newOrder.name},\n\nThanks for booking your artwork with Shruti's Art! We'll be in touch shortly.`
});

    try {
  await transporter.sendMail({
    from: `"Shruti's Art" <${process.env.SMTP_EMAIL}>`,
    to: newOrder.email,
    subject: 'Thank you for your order 🎨',
    text: `Hi ${newOrder.name},\n\nThank you for booking a custom artwork with me! I’ll review your request and get in touch shortly.\n\n— Shruti's Art`
  });
  console.log("✅ Email sent to customer");
} catch (err) {
  console.error("❌ Email send failed:", err.message);
}

    res.status(201).json({ message: 'Order submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save order.' });
  }
});


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/*// ✅ Serve static HTML/CSS/JS from public folder
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend')));*/
