import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(morgan("dev")); // logs all requests

// -------------------- DATABASE --------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

// -------------------- CONTACT FORM --------------------
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Save to DB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // 2. Send email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASS },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL,
      subject: `📩 New message from ${name}`,
      text: message,
    });

    res.json({ success: true, message: "Message sent successfully ✅" });
  } catch (err) {
    console.error("Error in /contact:", err);
    res.status(500).json({ success: false, message: "Failed to send message ❌" });
  }
});

// -------------------- PROJECTS API --------------------
app.get("/api/projects", (req, res) => {
  res.json([
    {
      title: "Portfolio Website",
      desc: "Modern portfolio website using HTML, CSS, JS, and Node backend.",
      img: "project1.jpg",
    },
    {
      title: "Obstacle Avoiding Robot",
      desc: "Robotics project using Arduino & sensors.",
      img: "project2.jpg",
    },
  ]);
});

// -------------------- SKILLS API --------------------
app.get("/api/skills", (req, res) => {
  res.json([
    "Python",
    "Java",
    "JavaScript",
    "C",
    "C++",
    "Node.js",
    "React",
    "MongoDB",
  ]);
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
