# Nirmal Carbon — Indian Carbon Credit Marketplace Backend

Production-grade Node.js + Express.js backend for **Nirmal Carbon**, an Indian carbon credit marketplace with transactional payments, PDF offset certificates, a gamification/loyalty engine, and full OpenAPI documentation.

---

## 1. Prerequisites
- **Node.js**: 20.x LTS or higher
- **MongoDB**: 7.x or higher (run locally or on Atlas)
- **Razorpay**: Test account keys (for simulated payments)
- **Resend API**: Account key (for transactional notifications)

---

## 2. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

---

## 3. Environment Variables
Copy `.env.example` to `.env` and fill out your credentials:
```bash
cp .env.example .env
```

### Configuration Parameters Explained:
- `PORT`: Server port (default: `5000`).
- `MONGO_URI`: Connection string for MongoDB (default: `mongodb://localhost:27017/nirmal_carbon`).
- `JWT_SECRET`: Minimum 32-character key for signing secure JWT tokens.
- `JWT_EXPIRES_IN`: Access token validity duration (recommended: `15m`).
- `REFRESH_TOKEN_EXPIRES_DAYS`: Refresh token database retention lifecycle in days (recommended: `7`).
- `RAZORPAY_KEY_ID`: Razorpay test key ID.
- `RAZORPAY_KEY_SECRET`: Razorpay test key secret.
- `RAZORPAY_WEBHOOK_SECRET`: Secure webhook verification key.
- `RESEND_API_KEY`: API authorization key for transactional emails.
- `RESEND_FROM_EMAIL`: Authorized sender email registered on Resend (default: `notifications@nirmalcarbon.in`).
- `ALLOWED_ORIGINS`: Comma-separated list of origins for CORS validation.

> [!NOTE]
> If `RESEND_API_KEY` is empty, or `NODE_ENV` is set to `development`, emails are safely mocked and logged directly to the console instead of firing.

---

## 4. Running the Server

### Development Mode (auto-reload with nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

---

## 5. Seeding Database
A comprehensive seeder script is included. This drops any previous collections and seeds the database with **12 Users, 8 Projects, 17 Transactions, 12 Rewards**, plus corresponding holdings and system notifications.

To seed the database:
```bash
npm run seed
```

---

## 6. Swagger API Sandbox
The entire API is documented via JSDoc OpenAPI specifications. To explore, authorize, and test all backend endpoints interactively, visit the Swagger Sandbox at:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 7. Authentication Flow Guide
1. Go to `/api/auth/login` (or `/api/auth/register`).
2. Provide valid user credentials.
3. From the successful JSON response, copy the `data.accessToken` string.
4. Click the green **Authorize** button at the top right of the Swagger interface.
5. Paste the token in the input box and click **Authorize**.
6. All protected routes are now fully unlocked for testing!

---

## 8. Role Permissions Matrix

| Route Group | Path Prefix | Public | Individual | Corporate | Firm | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Auth** | `/api/auth/*` | Yes (login/reg) | Me / Logout | Me / Logout | Me / Logout | Me / Logout |
| **Users** | `/api/users/*` | No | Full Access | Full Access | Full Access | Full Access |
| **Projects** | `/api/projects/*` | List / Search / Details | Read | Read | Create / Edit Own | Verify / Reject / Delete |
| **Payments** | `/api/payments/*` | Webhook Only | Create / Verify | Create / Verify | No | Webhook Read |
| **Transactions** | `/api/transactions/*` | No | Own | Own | No | Read All |
| **Holdings** | `/api/holdings/*` | No | Own Read | Own / **Retire Credits** | No | Read All |
| **Rewards** | `/api/rewards/*` | List / Details | History | History | No | Create / Update / Delete |
| **Dashboards** | `/api/dashboard/*` | Leaderboard | Individual | Individual | Firm | Admin |
| **Admin** | `/api/admin/*` | No | No | No | No | **Full Admin Controls** |

---

## 9. Seed Demo Credentials
Use these pre-configured user credentials to log in and test different dashboard features:

| Email | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| **admin@nirmalcarbon.in** | `Demo@1234` | **admin** | Full platform KPIs, project approvals, user editing, analytics |
| **greenearth@nirmalcarbon.in** | `Demo@1234` | **firm** | Developer profile, project upload draft, sales stats |
| **techcorp@nirmalcarbon.in** | `Demo@1234` | **corporate** | Corporate carbon buyer, **Retire Credits** dashboard |
| **kavya@example.com** | `Demo@1234` | **individual** | Standard buyer, gamification stats, certificate lists, high levels |

---

## 10. Razorpay Test Sandbox
To simulate successful credit purchases, check out using Razorpay's native sandbox test mode:
- **Card Number**: `4111 1111 1111 1111` (Visa Test Card)
- **Expiry**: Any future date (e.g., `12/30`)
- **CVV**: Any 3-digit number (e.g., `123`)
- **OTP**: Any 4-digit code (e.g., `1234`)

---

## 11. Git Ignore
This repository includes a `.gitignore` file to keep local development artifacts out of source control.

Ignored items include:
- `node_modules/`
- local environment files like `.env`
- editor and OS temporary files
- build, coverage, and log output

If you need to keep additional local files private, add them to `.gitignore` before committing.
