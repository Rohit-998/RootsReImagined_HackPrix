import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { generateOTP, storeOTP } from '@/lib/otpStore.js';

export async function POST(request) {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const { phone } = await request.json();

    if (!phone || !/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Normalise to E.164 (assume India +91 if no country code)
    const normalised = phone.startsWith('+') ? phone : `+91${phone.replace(/^0/, '')}`;

    const otp = generateOTP();
    storeOTP(normalised, otp);

    await client.messages.create({
      body: `MediGuard: Your OTP to report a counterfeit medicine is ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalised,
    });

    return NextResponse.json({ success: true, phone: normalised });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
