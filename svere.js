// server.js
import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(express.static("public")); // serve frontend
app.use(bodyParser.json());
app.use(morgan("dev"));

// -------------------- DATABASE --------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=> console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ MongoDB error:", err));

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

// -------------------- CONTACT FORM ROUTE --------------------
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Save to MongoDB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // 2. Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASS },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL, // your Gmail
      subject: `📩 New message from ${name}`,
      text: message,
    });

    res.json({ success: true, message: "Message sent successfully ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send message ❌" });
  }
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
