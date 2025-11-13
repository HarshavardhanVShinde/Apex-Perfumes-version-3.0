import { NextResponse } from 'next/server'

// Create Razorpay order on the server
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, currency = 'INR', receipt, notes } = body || {}

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Missing Razorpay credentials' }, { status: 500 })
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const payload = {
      amount, // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1,
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: 'Failed to create Razorpay order', details: errText }, { status: 502 })
    }

    const order = await res.json()
    return NextResponse.json(order, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}