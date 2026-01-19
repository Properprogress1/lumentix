# 🌟 Lumentix Backend – Stellar Event Platform API

The backend powering **Lumentix**, a decentralized event management platform built on the Stellar blockchain. Think of this as the brain that makes everything work—handling events, payments, sponsors, and all that blockchain magic ✨

---

## 🎯 What Does This Backend Do?

This API is the bridge between your frontend and the Stellar network. It handles:

- **Event Management**: Create, list, update, and delete events
- **User Authentication**: Traditional auth + Stellar wallet linking
- **Payment Orchestration**: Process payments, manage escrow, issue ticket tokens
- **Sponsor System**: Match sponsors with events, handle contributions
- **Ticket Verification**: Validate tickets on-chain via QR codes
- **Refund Logic**: Handle cancellations and automatic refunds

Basically, if it involves data or blockchain operations, this backend does it (and does it well).

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js (or Fastify if you're feeling fancy)
- **Database**: PostgreSQL (for events, users, registrations)
- **Stellar SDK**: `stellar-sdk` for blockchain operations
- **ORM**: Prisma or TypeORM (your choice)
- **Authentication**: JWT + Stellar wallet verification
- **API Style**: RESTful (GraphQL coming in Phase 2 maybe?)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL 14+ (or Docker)
- A Stellar account (testnet for development)
- Some testnet XLM (get it from [Stellar Laboratory](https://laboratory.stellar.org/))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your config

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

The API will be running at `http://localhost:8000` (or whatever port you configure).

---

## 📁 Project Structure

```
lumentix-backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── events.js
│   │   ├── users.js
│   │   ├── payments.js
│   │   └── sponsors.js
│   ├── services/           # Business logic
│   │   ├── stellar.js      # Stellar SDK wrapper
│   │   ├── payments.js      # Payment processing
│   │   ├── tickets.js      # Ticket token management
│   │   └── escrow.js       # Escrow account handling
│   ├── models/             # Database models
│   │   ├── Event.js
│   │   ├── User.js
│   │   ├── Registration.js
│   │   └── Sponsor.js
│   ├── routes/             # API routes
│   │   ├── events.js
│   │   ├── auth.js
│   │   ├── payments.js
│   │   └── sponsors.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/              # Helpers and utilities
│   │   ├── stellar.js
│   │   └── validators.js
│   └── app.js              # Express app setup
├── migrations/             # Database migrations
├── tests/                  # Test files
├── .env.example            # Environment variables template
├── package.json
└── README.md               # This file!
```

---

## 🔑 Core Features

### 1. Event Management

**Endpoints:**
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create new event (organizer only)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

**What it does:**
- Stores event metadata (title, description, dates, images) in PostgreSQL
- Creates Stellar asset for ticket tokens
- Sets up escrow account for payments
- Links organizer's Stellar account

### 2. Registration System

**Endpoints:**
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/:id/registrations` - List registrations (organizer only)
- `GET /api/users/registrations` - Get user's registrations

**Flow for Paid Events:**
1. User initiates registration
2. Backend creates payment transaction
3. User approves via wallet
4. Payment sent to escrow account
5. Ticket token issued to user
6. Registration record saved to database

**Flow for Free Events:**
1. User clicks register
2. Optional: Issue free ticket token
3. Registration record saved
4. Done! (much simpler)

### 3. Payment Processing

**Endpoints:**
- `POST /api/payments/initiate` - Start payment flow
- `GET /api/payments/:id/status` - Check payment status
- `POST /api/payments/:id/refund` - Process refund

**How it works:**
- Uses Stellar SDK to build transactions
- Creates escrow accounts for event funds
- Issues ticket tokens (e.g., `EVENT2024-TICKET`)
- Supports XLM, USDC, EURT, and other Stellar assets
- Handles multi-currency via path payments

### 4. Sponsor System

**Endpoints:**
- `GET /api/sponsors/requests` - List events seeking sponsors
- `POST /api/events/:id/sponsors/request` - Create sponsor request
- `POST /api/sponsors/contribute` - Sponsor an event
- `GET /api/events/:id/sponsors` - List event sponsors

**Features:**
- Sponsor tiers (Bronze/Silver/Gold)
- Funding goals and deadlines
- Multi-signature escrow for sponsor funds
- Automatic milestone-based payouts

### 5. Ticket Verification

**Endpoints:**
- `POST /api/tickets/verify` - Verify ticket via QR code
- `GET /api/tickets/:id` - Get ticket details

**Process:**
- QR code contains ticket token ID
- Backend queries Stellar network via Horizon API
- Validates token ownership
- Marks ticket as used (optional: burn token)

---

## 🔐 Authentication

### Traditional Auth
- Email/password registration
- JWT tokens for session management
- Password hashing with bcrypt

### Stellar Wallet Linking
- Users can link their Stellar wallet
- Verification via signed challenge transaction
- Supports Freighter, LOBSTR, and other wallets

### API Authentication
- Protected routes require JWT token
- Include token in `Authorization: Bearer <token>` header

---

## 💰 Stellar Integration

### Network Configuration

```javascript
// Testnet (development)
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = 'Test SDF Network ; September 2015';

// Mainnet (production)
const server = new StellarSdk.Server('https://horizon.stellar.org');
const networkPassphrase = 'Public Global Stellar Network ; September 2015';
```

### Key Operations

**Creating Escrow Accounts:**
- Generate keypair for each event
- Fund with minimum balance (1 XLM)
- Set up time-bound operations for auto-refunds

**Issuing Ticket Tokens:**
- Create asset code (e.g., `EVENT2024-TICKET`)
- Issue tokens to user accounts
- Set trustlines if needed

**Processing Payments:**
- Build payment transaction
- Add memo with event/registration ID
- Submit to network
- Monitor via Horizon API

---

## 🗄️ Database Schema

### Core Tables

**Events**
- `id`, `title`, `description`, `organizer_id`
- `start_date`, `end_date`, `location`
- `price_xlm`, `price_usdc`, `max_attendees`
- `stellar_asset_code`, `escrow_account_secret`
- `sponsor_goal`, `sponsor_deadline`
- `created_at`, `updated_at`

**Users**
- `id`, `email`, `password_hash`
- `stellar_public_key`, `wallet_linked`
- `role` (user/organizer/admin)
- `created_at`, `updated_at`

**Registrations**
- `id`, `event_id`, `user_id`
- `ticket_token_id`, `payment_tx_hash`
- `status` (pending/confirmed/cancelled)
- `created_at`, `updated_at`

**Sponsors**
- `id`, `event_id`, `sponsor_user_id`
- `tier`, `amount`, `payment_tx_hash`
- `status`, `created_at`

---

## 🔧 Environment Variables

Create a `.env` file:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lumentix

# Stellar
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Platform Account (for fees, escrow management)
PLATFORM_SECRET_KEY=your_secret_key_here
PLATFORM_PUBLIC_KEY=your_public_key_here

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional: IPFS (for event images)
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests (requires testnet)
npm run test:integration
```

**Testnet Setup:**
- Get testnet XLM from [Stellar Laboratory](https://laboratory.stellar.org/)
- Use testnet Horizon API
- Create test accounts for different scenarios

---

## 🚨 Error Handling

The API uses consistent error responses:

```json
{
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event with ID 123 does not exist",
    "status": 404
  }
}
```

**Common Error Codes:**
- `INVALID_CREDENTIALS` - Auth failure
- `EVENT_NOT_FOUND` - Event doesn't exist
- `PAYMENT_FAILED` - Stellar transaction failed
- `INSUFFICIENT_BALANCE` - Not enough XLM
- `TICKET_ALREADY_USED` - Ticket verification failed

---

## 📊 API Rate Limiting

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Payment endpoints**: 10 requests/minute (to prevent spam)

---

## 🔒 Security Best Practices

- ✅ Always validate user input
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Rate limit sensitive endpoints
- ✅ Store secrets in environment variables
- ✅ Use HTTPS in production
- ✅ Validate Stellar signatures
- ✅ Implement CORS properly
- ✅ Log suspicious activities

---

## 🐛 Debugging

### Enable Stellar Transaction Logging

```javascript
// In your stellar service
console.log('Transaction XDR:', transaction.toXDR());
console.log('Transaction Hash:', transaction.hash().toString('hex'));
```

### Check Horizon API

```bash
# Get account info
curl https://horizon-testnet.stellar.org/accounts/GABCD...

# Get transaction
curl https://horizon-testnet.stellar.org/transactions/abc123...
```

---

## 📈 Monitoring & Logging

- **Logging**: Use Winston or Pino for structured logs
- **Monitoring**: Track API response times, error rates
- **Alerts**: Set up alerts for failed payments, high error rates
- **Analytics**: Track event creation, registrations, payments

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Basic event CRUD
- [x] User authentication
- [x] Free and paid registration
- [x] Basic payment processing
- [x] Sponsor listing

### Phase 2: Enhanced Features 🚧
- [ ] Transferable ticket tokens
- [ ] Multi-currency support
- [ ] Automated refunds (time-bound operations)
- [ ] QR code ticket verification
- [ ] Sponsor tiers and benefits
- [ ] Revenue sharing (platform fees)

### Phase 3: Advanced Features 🔮
- [ ] Soroban smart contracts
- [ ] Recurring events
- [ ] Event analytics API
- [ ] Sponsor matching algorithm
- [ ] Multi-signature escrow
- [ ] NFT event badges

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**Code Style:**
- Use ESLint/Prettier
- Follow existing patterns
- Write meaningful commit messages
- Add tests for new features

---

## 📚 Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar SDK (JavaScript)](https://github.com/stellar/js-stellar-sdk)
- [Horizon API Reference](https://developers.stellar.org/api)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Express.js Guide](https://expressjs.com/)

---

## 💡 Tips & Tricks

**Development:**
- Use Stellar testnet for everything until you're ready
- Keep testnet XLM handy (you can always get more)
- Use Stellar Laboratory to inspect transactions
- Test with multiple accounts (organizer, attendee, sponsor)

**Production:**
- Monitor escrow account balances
- Set up alerts for failed transactions
- Keep platform account funded
- Backup database regularly
- Use environment-specific configs

---

## 🆘 Troubleshooting

**"Insufficient balance" errors:**
- Check account has enough XLM for fees
- Verify minimum balance requirements (1 XLM per account)

**"Transaction failed" errors:**
- Check network passphrase matches
- Verify account sequence numbers
- Ensure trustlines are set for custom assets

**Database connection issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

---

## 📄 License

MIT License - do whatever you want with it!

---

**Built with ❤️ and ⚡ on the Stellar network**

*Remember: With great blockchain power comes great responsibility (and really low fees)*
