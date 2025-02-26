# Clothing Store Backend

This is the backend service for the **Clothing Store** application, built using **Node.js** and **Express.js**. It supports authentication, data persistence with MongoDB, and exposes REST and GraphQL APIs for managing users and purchases.

## Features

- **Authentication & Authorization**: Uses Passport.js for user authentication.
- **Database**: MongoDB with Mongoose for data persistence.
- **API**:
  - REST API operations.
  - GraphQL support.
- **Security Enhancements**:
  - Helmet.js for HTTP security.
  - CORS configuration for frontend requests.
  - Compression middleware for optimized performance.
  - Passport for security and authentication
- **Templating**: Express Handlebars for view rendering (for testing purposes only).

## Installation

### Prerequisites

- Node.js (>= 22.x)
- MongoDB instance (local or cloud)
- NPM

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/pramirez2328/clothing-store-backend
   cd clothing-store-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add its variables.

4. Start the server:
   ```sh
   npm start
   ```

## Project Structure

```
clothing-store-backend/
│── config/           # Configuration files (Passport)
│── graphql/          # GraphQL schema and resolvers
│── middleware/       # Custom middleware
│── models/           # Mongoose models (User, Purchase)
│── routes/           # Express routes
│── views/            # Handlebars templates
│── .env              # Environment variables (ignored in Git)
│── app.js            # Main Express application entry point
│── package.json      # Project metadata and dependencies
│── render.yaml       # Deployment configuration
```

## Dependencies

The project uses the following dependencies:

- **Authentication & Security**:

  - `passport`
  - `passport-local`
  - `bcryptjs`
  - `jsonwebtoken`
  - `helmet`
  - `cors`

- **Server & Middleware**:

  - `express`
  - `compression`
  - `dotenv`
  - `express-handlebars`

- **Database**:

  - `mongoose`

- **GraphQL**:

  - `graphql`
  - `graphql-http`

- **Utilities**:
  - `uuid`
  - `nodemon` (for development)

## GraphQL Queries

The project includes the following GraphQL queries:

- **User Queries**:

  - `user(id: ID)`: Fetches a user by ID, including their purchases.

- **Purchase Queries**:

  - `purchases(userId: ID)`: Retrieves all purchases for a given user.
  - `purchase(purchaseId: String)`: Fetches a single purchase by purchase ID.

- **Schema Definitions**:
  - **User Type**: Contains `id`, `username`, `email`, and a list of `purchases`.
  - **Purchase Type**: Includes `id`, `purchaseId`, `userId`, a list of `items`, `totalAmount`, and `createdAt` with a timestamp conversion function.
  - **Item Type**: Defines `productId`, `title`, `price`, `orderQty`, `selectedSize`, and `thumbnail`.

## API Endpoints

### REST API

- **Authentication**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/profile` - User profile
- **Purchases**
  - `GET /api/purchases/create` - Create a new purchase

### GraphQL API

GraphQL is available at `/graphql` with queries and mutations defined in `graphql/schema.js`.

## Deployment

This project is configured for deployment on **Render.com**.

## License

This project is licensed under the MIT License.

---

**Maintainer**: Pedro Ramirez
