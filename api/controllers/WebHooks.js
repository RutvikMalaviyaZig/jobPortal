const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const endpointSecret = 'whsec_a750b26bf6e160541eadb4cad409e307996a4b536b78d1f9bdda7333918ef49e';

const webHook = (req, res) => {
    const sigHeader = req.headers['stripe-signature'];
    const payload = JSON.stringify(req.body);
  
    try {
      // Verify the webhook signature
      const event = stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
      
      // Handle the event (e.g., payment_intent.succeeded)
      console.log('Received event:', event);
  
      res.status(200).send('Webhook received');
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook error: ${err.message}`);
    }
  }

const listenEvent = (req, res) => {
    console.log('Received Stripe event:', req.body);
  
    // Process the event here
    res.status(200).send('Webhook received');
  }
module.exports ={
    webHook,listenEvent
}