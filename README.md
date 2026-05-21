# Nirmal Carbon — Indian Carbon Credit Marketplace Backend

A polished, production-ready Node.js + Express backend for **Nirmal Carbon** — an Indian carbon credit marketplace with:
- Transaction processing through **Razorpay**
- On-demand **PDF offset certificates**
- **Gamification** and loyalty points
- **Mongoose** data models with full **OpenAPI** documentation
- Email workflows powered by **Resend** and React-based templates

---

## Table of Contents

1. [Why This Backend](#why-this-backend)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Scripts](#scripts)
6. [API Documentation](#api-documentation)
7. [Seeding the Database](#seeding-the-database)
8. [Authentication Flow](#authentication-flow)
9. [User Roles & Access](#user-roles--access)
10. [Demo Credentials](#demo-credentials)
11. [Razorpay Sandbox](#razorpay-sandbox)
12. [Troubleshooting](#troubleshooting)
13. [License](#license)

---

## Why This Backend

This backend is built for a modern carbon marketplace and includes:
- **Modular API layers** for users, projects, payments, transactions, rewards, and admin controls.
- **Secure authentication** with JWT access and refresh tokens.
- **Real-time business logic** for credit holdings, retirement, and reward points.
- **Comprehensive validation** using request schemas and centralized error handling.
- **Swagger-driven API discovery** so frontend and QA teams can onboard quickly.

---

## Tech Stack

- Node.js 20.x+ / ES modules
- Express.js
- MongoDB / Mongoose
- Razorpay payments
- Resend transactional emails
- Swagger UI / swagger-jsdoc
- Winston logging
- Helmet, CORS, rate limiting and other security middleware

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/<your-org>/GreenVision-Backend.git
cd GreenVision-Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example env file and update values:

```bash
cp .env.example .env
```

> On Windows PowerShell, use:
> `Copy-Item .env.example .env`

### 4. Start the app

```bash
npm run dev
```

The backend starts on `http://localhost:5000` by default.

---

## Environment Variables

The example file contains every configuration key used by the app.
Update the values before running locally or deploying.

| Variable | Purpose | Suggested Value |
| --- | --- | --- |
| `PORT` | HTTP port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URI` | MongoDB connection | `mongodb://localhost:27017/nirmal_carbon` |
| `JWT_SECRET` | JWT signing secret | 32+ chars |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Refresh token retention | `7` |
| `RAZORPAY_KEY_ID` | Razorpay test key ID | `rzp_test_xxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret | `your_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook verification secret | `your_webhook_secret` |
| `RESEND_API_KEY` | Resend email API key | `re_xxx` |
| `RESEND_FROM_EMAIL` | Transactional sender email | `notifications@nirmalcarbon.in` |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key | optional |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret | optional |
| `AWS_REGION` | AWS region | `ap-south-1` |
| `AWS_BUCKET_NAME` | S3 bucket name | `nirmal-carbon` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `FRONTEND_URL` | Frontend app URL | `http://localhost:3000` |
| `POINTS_PER_CREDIT` | Points awarded per credit purchase | `10` |

> Note: If `RESEND_API_KEY` is missing or `NODE_ENV=development`, outgoing emails are mocked and logged instead of being sent.

---

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Run the production server (`node server.js`) |
| `npm run dev` | Run with `nodemon` for live reload |
| `npm run seed` | Seed the database with demo data |

---

## API Documentation

Swagger documentation is generated from JSDoc comments across the codebase.
After starting the server, open:

**http://localhost:5000/api/docs**

Use the **Authorize** button to pass a valid bearer token and test protected routes.

---

## Seeding the Database

A rich seeder script creates demo data for:
- Users
- Projects
- Transactions
- Rewards
- Credit holdings
- Notifications

Run:

```bash
npm run seed
```

---

## Authentication Flow

1. Register or login at `/api/auth/register` or `/api/auth/login`
2. Copy the returned `data.accessToken`
3. Open Swagger and click **Authorize**
4. Paste the token into the Bearer auth field
5. Call protected endpoints like `/api/users/me`, `/api/projects`, `/api/dashboard`

---

## User Roles & Access

| Role | Scope | Typical access |
| --- | --- | --- |
| `admin` | Full platform administration | Approve/reject projects, manage users, view global metrics |
| `firm` | Project creators | Upload projects, manage firm profile, view sales stats |
| `corporate` | Credit buyers | Purchase carbon credits, retire credits, view purchase history |
| `individual` | Buyers and consumers | Browse projects, buy credits, claim rewards |

---

## Demo Credentials

| Email | Password | Role |
| --- | --- | --- |
| `admin@nirmalcarbon.in` | `Demo@1234` | `admin` |
| `greenearth@nirmalcarbon.in` | `Demo@1234` | `firm` |
| `techcorp@nirmalcarbon.in` | `Demo@1234` | `corporate` |
| `kavya@example.com` | `Demo@1234` | `individual` |

---

## Razorpay Sandbox

Use the following card details for Razorpay sandbox testing:

- Card number: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3-digit number
- OTP: any 4-digit number

---

## Troubleshooting

- **MongoDB connection failed**: verify `MONGO_URI` and Atlas IP whitelist.
- **Email not sending**: check `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- **Swagger not showing**: confirm the server is running and open `/api/docs`.
- **Duplicate email index warning**: ensure each schema defines the email index only once.

---

## License

MIT

---

## 11. Git Ignore
This repository includes a `.gitignore` file to keep local development artifacts out of source control.

Ignored items include:
- `node_modules/`
- local environment files like `.env`
- editor and OS temporary files
- build, coverage, and log output

If you need to keep additional local files private, add them to `.gitignore` before committing.
