import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import cors from 'cors'; // import cors correctly
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.send('Its live');
})

app.post('/referrals', async (req, res) => {
  const { name, email, referral, course} = req.body;
  console.log(req.body);
  if (!name || !email || !referral || !course) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newReferral = await prisma.referral.create({
      data: { name, email, referral, course },
    });

    sendReferralEmail(name, email, referral);
    sendReferralEmailMain(name,referral,course)
    res.status(201).json(newReferral);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to save referral data' });
    }
  }
});

const sendReferralEmail = (name, email, referral) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Referral Confirmation',
    text: `Hello ${name},\n\nThank you for referring ${referral}. We appreciate your support!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const sendReferralEmailMain = (name,referral,course) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: referral,
    subject: 'You have been referred',
    text: `You have been referred by ${name} for the following course: ${course},\n\n We appreciate your support!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
