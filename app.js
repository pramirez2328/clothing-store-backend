require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const { engine } = require('express-handlebars');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('./graphql/schema');
const compression = require('compression');
const helmet = require('helmet');

// Load Passport config
require('./config/passport');

const app = express();

// Use security and compression middleware
app.use(helmet()); // Enable Helmet for security
app.use(compression()); // Enable compression for performance

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow requests from your frontend's origin
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:5001', // Development
  'https://retailclothingstore.onrender.com', // Production
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS Blocked Request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

// Required for Passport authentication
app.use(passport.initialize());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('🚨 MongoDB connection error:', err));

// Handlebars Configuration... this is for testing purposes only
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
  }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// GraphQL Endpoint
app.all(
  '/graphql',
  createHandler({
    schema: schema,
    graphiql: true,
  }),
);

// this is for testing purposes only
app.get('/', (req, res) => {
  res.render('home', { title: 'Welcome to the Clothing Store' });
});

// Routes
const authRoutes = require('./routes/auth');
const purchaseRoutes = require('./routes/purchases');

app.use('/api/auth', authRoutes);
app.use('/api/purchases', purchaseRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🌐 http://localhost:5001');
  console.log(`🚀 GraphQL running at ${PORT}`);
});
