// api/process-payment.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default async function handler(req, res) {
    const { method } = req;
    
    switch (method) {
        case 'POST':
            return handlePayment(req, res);
        case 'GET':
            return verifyPayment(req, res);
        default:
            res.setHeader('Allow', ['POST', 'GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

async function handlePayment(req, res) {
    const { amount, currency = 'INR', plan, paymentMethod } = req.body;
    
    try {
        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Amount in paise
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
            notes: {
                plan: plan,
                paymentMethod: paymentMethod
            }
        });
        
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

async function verifyPayment(req, res) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.query;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (isAuthentic) {
        // Payment is successful
        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Invalid payment signature'
        });
    }
}