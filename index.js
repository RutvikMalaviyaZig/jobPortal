require("dotenv").config();
const express = require("express");
const sequelize = require("./config/database");
const bodyParser = require("body-parser");

const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

const routes  = require('./api/routes')

// test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

//middleware 
app.use(express.json());
// Middleware to parse the raw body (required for Stripe signature verification)
app.use("/webhook", bodyParser.raw({ type: "application/json" }));
// inport routes
app.use('/api', routes)


app.get("/", (req, res) => {
  res.send("hello world");
});

app.post('/webhook', (req, res) => {
  console.log('Received Stripe event:', req.body);

  // Process the event here
  res.status(200).send('Webhook received');
});

const endpointSecret = 'whsec_a750b26bf6e160541eadb4cad409e307996a4b536b78d1f9bdda7333918ef49e';

app.post('/webhook',(req, res) => {
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
})

app.listen(PORT, (req, res) => {
  console.log(`server is listening at http://localhost:${PORT}`);
});
