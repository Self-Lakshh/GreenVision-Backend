import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import Transaction from '../src/models/Transaction.js';
import CreditHolding from '../src/models/CreditHolding.js';
import Reward from '../src/models/Reward.js';
import Notification from '../src/models/Notification.js';
import RefreshToken from '../src/models/RefreshToken.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

const SALT_ROUNDS = 12;
const DEMO_PASSWORD = 'Demo@1234';

async function hashPassword(pw) {
  return await bcrypt.hash(pw, SALT_ROUNDS);
}

async function seedUsers() {
  console.log('📦 Dropping User collection...');
  await User.deleteMany({});
  console.log('🔐 Hashing demo password...');
  const hashed = await hashPassword(DEMO_PASSWORD);
  const users = [
    {
      name: 'Admin User',
      email: 'admin@nirmalcarbon.com',
      role: 'admin',
      password: hashed,
    },
    {
      name: 'Demo User',
      email: 'demo@nirmalcarbon.com',
      role: 'user',
      password: hashed,
    },
  ];
  console.log('💾 Inserting users...');
  const created = await User.insertMany(users);
  console.log(`✅ ${created.length} users created`);
  return created;
}

async function seedProjects() {
  console.log('📦 Dropping Project collection...');
  await Project.deleteMany({});
  const projects = [
    {
      name: 'Solar Farm Kerala',
      description: 'Utility‑scale solar installation in Kerala',
      location: 'Kerala, India',
      creditAmount: 5000,
    },
    {
      name: "Mangrove Restoration Tamil Nadu",
      description: 'Community‑driven mangrove planting project',
      location: 'Tamil Nadu, India',
      creditAmount: 3000,
    },
  ];
  console.log('💾 Inserting projects...');
  const created = await Project.insertMany(projects);
  console.log(`✅ ${created.length} projects created`);
  return created;
}

async function seedTransactionsAndHoldings(users, projects) {
  console.log('📦 Dropping Transaction and CreditHolding collections...');
  await Transaction.deleteMany({});
  await CreditHolding.deleteMany({});

  const transactions = [];
  const holdings = [];

  // Simple seed: each demo user buys credits from first project
  const buyer = users.find(u => u.role === 'user');
  const seller = users.find(u => u.role === 'admin');
  const project = projects[0];

  const transaction = {
    buyer: buyer._id,
    seller: seller._id,
    project: project._id,
    creditAmount: 1000,
    price: 1200, // INR
    status: 'completed',
    createdAt: new Date(),
  };
  transactions.push(transaction);

  const holding = {
    user: buyer._id,
    project: project._id,
    creditAmount: transaction.creditAmount,
    acquiredAt: new Date(),
  };
  holdings.push(holding);

  console.log('💾 Inserting transactions...');
  const createdTx = await Transaction.insertMany(transactions);
  console.log(`✅ ${createdTx.length} transactions created`);

  console.log('💾 Inserting credit holdings...');
  const createdHold = await CreditHolding.insertMany(holdings);
  console.log(`✅ ${createdHold.length} credit holdings created`);

  return { createdTx, createdHold };
}

async function seedRewards() {
  console.log('📦 Dropping Reward collection...');
  await Reward.deleteMany({});
  const rewards = [
    {
      title: 'Early Bird Discount',
      description: '5% off on first purchase',
      pointsRequired: 200,
    },
    {
      title: 'Referral Bonus',
      description: 'Earn 100 credits for each successful referral',
      pointsRequired: 500,
    },
  ];
  console.log('💾 Inserting rewards...');
  const created = await Reward.insertMany(rewards);
  console.log(`✅ ${created.length} rewards created`);
  return created;
}

async function seedNotifications(users) {
  console.log('📦 Dropping Notification collection...');
  await Notification.deleteMany({});
  const notifications = [];
  for (const user of users) {
    notifications.push({
      user: user._id,
      message: 'Welcome to Nirmal Carbon! 🎉',
      read: false,
      createdAt: new Date(),
    });
  }
  console.log('💾 Inserting notifications...');
  const created = await Notification.insertMany(notifications);
  console.log(`✅ ${created.length} notifications created`);
  return created;
}

async function seedRefreshTokens(users) {
  console.log('📦 Dropping RefreshToken collection...');
  await RefreshToken.deleteMany({});
  const tokens = [];
  const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
  for (const user of users) {
    tokens.push({
      user: user._id,
      token: 'placeholder-refresh-token-' + user._id,
      expiresAt: new Date(Date.now() + expiresIn),
    });
  }
  console.log('💾 Inserting refresh tokens...');
  const created = await RefreshToken.insertMany(tokens);
  console.log(`✅ ${created.length} refresh tokens created`);
  return created;
}

async function main() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const users = await seedUsers();
    const projects = await seedProjects();
    await seedTransactionsAndHoldings(users, projects);
    await seedRewards();
    await seedNotifications(users);
    await seedRefreshTokens(users);

    console.log('\n=================== Seed Summary ===================');
    console.log(`✅ Users:            ${users.length}`);
    console.log(`✅ Projects:         ${projects.length}`);
    console.log('✅ Transactions & Credit Holdings: 1');
    console.log('✅ Rewards:          2');
    console.log(`✅ Notifications:    ${users.length}`);
    console.log(`✅ Refresh Tokens:   ${users.length}`);
    console.log('===================================================\n');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
