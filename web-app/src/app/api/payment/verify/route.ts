import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = await request.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return NextResponse.json({
                message: 'Payment verified successfully',
                success: true
            });
        } else {
            return NextResponse.json(
                { message: 'Invalid signature', success: false },
                { status: 400 }
            );
        }

    } catch (error: any) {
        console.error('Error verifying Razorpay payment:', error);
        return NextResponse.json(
            { error: 'Error verifying payment' },
            { status: 500 }
        );
    }
}
