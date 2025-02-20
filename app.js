require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const { engine } = require('express-handlebars');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('./graphql/schema');

// Load Passport config
require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow requests from your frontend's origin
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
};

// Enable CORS with the specified options
app.use(cors(corsOptions));
// Required for Passport authentication
app.use(passport.initialize());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-store')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('🚨 MongoDB connection error:', err));

// Handlebars Configuration... this is for testing purposes only
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts')
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// GraphQL Endpoint
app.all(
  '/graphql',
  createHandler({
    schema: schema,
    graphiql: true
  })
);

// Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Welcome to the Clothing Store' });
});

const authRoutes = require('./routes/auth');
const purchaseRoutes = require('./routes/purchases');

app.use('/api/auth', authRoutes);
app.use('/api/purchases', purchaseRoutes);

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🌐 http://localhost:5001');
  console.log('🚀 GraphQL running at http://localhost:5001/graphql');
});
