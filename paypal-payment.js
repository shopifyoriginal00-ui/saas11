// api/paypal-payment.js
const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment
const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { amount, plan } = req.body;
        
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: Math.round(amount / 83).toString() // Convert INR to USD
                },
                description: `100Tools Platform - ${plan} Plan`
            }]
        });
        
        try {
            const order = await client.execute(request);
            res.status(200).json({
                success: true,
                orderId: order.result.id
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}