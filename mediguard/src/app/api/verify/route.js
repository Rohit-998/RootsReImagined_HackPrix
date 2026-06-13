import { NextResponse } from 'next/server';
import { verifyMedicine } from '@/services/verificationEngine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { qrData, userLocation } = body;

    if (!qrData || !qrData.batch_id || !qrData.serial_number) {
      return NextResponse.json({ error: 'Invalid QR Data provided' }, { status: 400 });
    }

    const verificationResult = await verifyMedicine(qrData, userLocation);

    return NextResponse.json(verificationResult, { status: 200 });
  } catch (error) {
    console.error("Error in verification API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
