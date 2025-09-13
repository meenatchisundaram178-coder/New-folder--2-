const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(express.static("public")); // serve your HTML/CSS/JS
app.use(bodyParser.urlencoded({ extended: true }));

// Connect MongoDB (optional, remove if you don't want DB)
mongoose.connect("mongodb://127.0.0.1:27017/portfolio");

const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", MessageSchema);

// Contact form
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Save to DB
  const newMessage = new Message({ name, email, message });
  await newMessage.save();

  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-app-password" // must create App Password in Gmail
    }
  });

  const mailOptions = {
    from: email,
    to: "your-email@gmail.com",
    subject: `New Message from ${name}`,
    text: message
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error sending message.");
    }
    res.send("Message stored and email sent!");
  });
});

// Projects API
app.get("/projects", (req, res) => {
  res.json([
    { title: "Portfolio Website", desc: "Modern portfolio website using HTML, CSS & JS.", img: "project1.jpg" },
    { title: "Obstacle Avoiding Robot", desc: "Robotics project using Arduino & sensors.", img: "project2.jpg" }
  ]);
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
