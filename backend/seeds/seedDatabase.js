/**
 * Database Seeder
 * Populates database with sample data for testing
 */

import pool from '../config/database.js';
import { initializeDatabase, dropDatabase } from '../database/schema.js';
import { hashPassword } from '../utils/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Drop existing tables
    await dropDatabase();

    // Initialize schema
    await initializeDatabase();

    // Create admin user
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = await hashPassword('Admin123!@#');
    const adminResult = await pool.query(
      `INSERT INTO users (email, password_hash, phone, first_name, last_name, role, two_fa_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, role`,
      [
        'admin@restaurant.com',
        adminPassword,
        '+971501234567',
        'Admin',
        'Manager',
        'admin',
        false,
      ]
    );
    console.log('✅ Admin created:', adminResult.rows[0].email);

    // Create manager user
    console.log('👨‍🔧 Creating manager user...');
    const managerPassword = await hashPassword('Manager123!@#');
    await pool.query(
      `INSERT INTO users (email, password_hash, phone, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'manager@restaurant.com',
        managerPassword,
        '+971501234568',
        'John',
        'Manager',
        'manager',
      ]
    );
    console.log('✅ Manager created');

    // Create waiter users
    console.log('👨‍💼 Creating waiter users...');
    const waiters = [];
    for (let i = 1; i <= 3; i++) {
      const waiterPassword = await hashPassword('Waiter123!@#');
      const waiterResult = await pool.query(
        `INSERT INTO users (email, password_hash, phone, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, first_name, last_name`,
        [
          `waiter${i}@restaurant.com`,
          waiterPassword,
          `+97150123456${i}`,
          `Waiter ${i}`,
          'Staff',
          'waiter',
        ]
      );
      waiters.push(waiterResult.rows[0]);
    }
    console.log(`✅ ${waiters.length} waiters created`);

    // Create customer users
    console.log('👥 Creating customer users...');
    const customers = [];
    const customerNames = [
      { first: 'Ahmed', last: 'Al-Maktoum' },
      { first: 'Fatima', last: 'Al-Nahyan' },
      { first: 'Mohammed', last: 'Al-Mansouri' },
      { first: 'Layla', last: 'Al-Zaabi' },
      { first: 'Hassan', last: 'Al-Suwaidi' },
    ];

    for (let i = 0; i < customerNames.length; i++) {
      const customerPassword = await hashPassword('Customer123!@#');
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, phone, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          `customer${i + 1}@email.com`,
          customerPassword,
          `+971501000${i}00`,
          customerNames[i].first,
          customerNames[i].last,
          'customer',
        ]
      );

      const customerResult = await pool.query(
        `INSERT INTO customers (user_id, phone, vip_tier, total_visits, total_spent)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id`,
        [
          userResult.rows[0].id,
          `+971501000${i}00`,
          ['bronze', 'silver', 'gold', 'platinum', 'bronze'][i],
          Math.floor(Math.random() * 50) + 5,
          Math.floor(Math.random() * 5000) + 500,
        ]
      );

      customers.push(customerResult.rows[0]);
    }
    console.log(`✅ ${customers.length} customers created`);

    // Create tables (10 tables total)
    console.log('🪑 Creating restaurant tables...');
    const tables = [];
    const tableConfigs = [
      { num: 1, capacity: 2, x: 100, y: 100 },
      { num: 2, capacity: 2, x: 200, y: 100 },
      { num: 3, capacity: 4, x: 100, y: 250 },
      { num: 4, capacity: 4, x: 250, y: 250 },
      { num: 5, capacity: 6, x: 400, y: 100 },
      { num: 6, capacity: 6, x: 400, y: 300 },
      { num: 7, capacity: 4, x: 550, y: 100 },
      { num: 8, capacity: 4, x: 550, y: 250 },
      { num: 9, capacity: 8, x: 300, y: 450 },
      { num: 10, capacity: 2, x: 100, y: 450 },
    ];

    for (const config of tableConfigs) {
      const tableResult = await pool.query(
        `INSERT INTO tables (table_number, capacity, floor_position_x, floor_position_y, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, table_number`,
        [config.num, config.capacity, config.x, config.y, 'free']
      );
      tables.push(tableResult.rows[0]);
    }
    console.log(`✅ ${tables.length} tables created`);

    // Create menu items
    console.log('🍽️  Creating menu items...');
    const menuItems = [
      // Appetizers
      {
        name: 'Hummus Selection',
        category: 'Appetizers',
        price: 45,
        cost: 12,
        prep_time: 5,
        desc: 'Trio of hummus: classic, roasted beet, and spicy',
      },
      {
        name: 'Crispy Calamari',
        category: 'Appetizers',
        price: 65,
        cost: 20,
        prep_time: 8,
        desc: 'Golden fried calamari with lemon aioli',
      },
      {
        name: 'Shrimp Saganaki',
        category: 'Appetizers',
        price: 75,
        cost: 25,
        prep_time: 10,
        desc: 'Pan-seared shrimp with cheese and tomato',
      },

      // Mains
      {
        name: 'Grilled Hammour',
        category: 'Main Course',
        price: 145,
        cost: 40,
        prep_time: 20,
        desc: 'Fresh Gulf hammour with seasonal vegetables',
      },
      {
        name: 'Wagyu Ribeye',
        category: 'Main Course',
        price: 185,
        cost: 80,
        prep_time: 18,
        desc: 'Prime Japanese wagyu with truffle mashed potato',
      },
      {
        name: 'Shawarma Plate',
        category: 'Main Course',
        price: 65,
        cost: 18,
        prep_time: 8,
        desc: 'Marinated chicken shawarma with garlic sauce',
      },
      {
        name: 'Lamb Kabab',
        category: 'Main Course',
        price: 125,
        cost: 38,
        prep_time: 15,
        desc: 'Chargrilled lamb skewers with chimichurri',
      },

      // Salads
      {
        name: 'Fattoush Salad',
        category: 'Salads',
        price: 55,
        cost: 15,
        prep_time: 8,
        desc: 'Mixed greens with sumac and crispy pita chips',
      },
      {
        name: 'Caesar Salad',
        category: 'Salads',
        price: 50,
        cost: 12,
        prep_time: 7,
        desc: 'Classic Caesar with parmesan and house croutons',
      },

      // Desserts
      {
        name: 'Baklava Trio',
        category: 'Desserts',
        price: 45,
        cost: 12,
        prep_time: 3,
        desc: 'Selection of pistachio, walnut, and mixed nut baklava',
      },
      {
        name: 'Umm Ali',
        category: 'Desserts',
        price: 40,
        cost: 10,
        prep_time: 15,
        desc: 'Traditional bread pudding with nuts and raisins',
      },
      {
        name: 'Chocolate Lava Cake',
        category: 'Desserts',
        price: 50,
        cost: 15,
        prep_time: 12,
        desc: 'Warm chocolate cake with molten center',
      },

      // Beverages
      {
        name: 'Fresh Mint Lemonade',
        category: 'Beverages',
        price: 25,
        cost: 3,
        prep_time: 2,
        desc: 'Homemade mint lemonade with ice',
      },
      {
        name: 'Arabic Coffee',
        category: 'Beverages',
        price: 15,
        cost: 2,
        prep_time: 5,
        desc: 'Traditional cardamom-spiced Arabic coffee',
      },
    ];

    for (const item of menuItems) {
      await pool.query(
        `INSERT INTO menu_items (name, description, category, price, cost, preparation_time_minutes, popularity_score, times_ordered)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.name,
          item.desc,
          item.category,
          item.price,
          item.cost,
          item.prep_time,
          Math.random() * 100,
          Math.floor(Math.random() * 150),
        ]
      );
    }
    console.log(`✅ ${menuItems.length} menu items created`);

    // Create sample reservations
    console.log('📅 Creating sample reservations...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    for (let i = 0; i < 3; i++) {
      const reservationTime = `${19 + i}:00:00`;
      await pool.query(
        `INSERT INTO reservations 
         (customer_id, guest_count, reservation_date, reservation_time, customer_name, customer_phone, customer_email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          customers[i].id,
          Math.floor(Math.random() * 6) + 2,
          tomorrowStr,
          reservationTime,
          `Guest ${i + 1}`,
          `+971501000${i}00`,
          `guest${i + 1}@email.com`,
          'pending',
        ]
      );
    }
    console.log('✅ Reservations created');

    // Create sample orders
    console.log('📦 Creating sample orders...');
    const allMenuItems = await pool.query('SELECT id, price FROM menu_items');
    const items = allMenuItems.rows;

    for (let i = 0; i < 5; i++) {
      const totalAmount = items
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .reduce((sum, item) => sum + parseFloat(item.price), 0);

      const orderResult = await pool.query(
        `INSERT INTO orders (order_number, table_id, customer_id, waiter_id, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          `ORD-${Date.now()}-${i}`,
          tables[i].id,
          customers[i % customers.length].id,
          waiters[i % waiters.length].id,
          totalAmount,
          'completed',
        ]
      );

      // Add order items
      for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        await pool.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderResult.rows[0].id, randomItem.id, 1, randomItem.price, 'served']
        );
      }

      // Create payment
      await pool.query(
        `INSERT INTO payments (order_id, amount, method, status, fraud_risk_level)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderResult.rows[0].id, totalAmount, 'card', 'completed', 'low']
      );
    }
    console.log('✅ Sample orders created');

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Admin: 1`);
    console.log(`   - Managers: 1`);
    console.log(`   - Waiters: ${waiters.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Tables: ${tables.length}`);
    console.log(`   - Menu Items: ${menuItems.length}`);
    console.log(`   - Sample Orders: 5\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
