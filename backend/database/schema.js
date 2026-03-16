/**
 * Database Schema - Restaurant Management System
 * PostgreSQL DDL (Data Definition Language)
 */

import pool from '../config/database.js';

/**
 * Initialize database schema
 */
export const initializeDatabase = async () => {
  try {
    console.log('🗄️  Initializing database schema...');

    // Users table (Admin and Staff)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'waiter', 'customer')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        two_fa_enabled BOOLEAN DEFAULT FALSE,
        two_fa_secret VARCHAR(255),
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // Customers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        phone VARCHAR(20) UNIQUE,
        favorite_dishes TEXT[], 
        total_visits INT DEFAULT 0,
        total_spent DECIMAL(12, 2) DEFAULT 0,
        average_order DECIMAL(12, 2) DEFAULT 0,
        vip_tier VARCHAR(50) DEFAULT 'bronze' CHECK (vip_tier IN ('bronze', 'silver', 'gold', 'platinum')),
        loyalty_points INT DEFAULT 0,
        last_visit TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
      CREATE INDEX IF NOT EXISTS idx_customers_vip_tier ON customers(vip_tier);
    `);

    // Tables (Floor Plan)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_number INT UNIQUE NOT NULL,
        capacity INT NOT NULL,
        floor_position_x FLOAT,
        floor_position_y FLOAT,
        floor_position_z FLOAT,
        status VARCHAR(50) DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'cleaning')),
        current_occupancy INT DEFAULT 0,
        reservation_id UUID,
        occupied_since TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
      CREATE INDEX IF NOT EXISTS idx_tables_number ON tables(table_number);
    `);

    // Menu Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        cost DECIMAL(10, 2),
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT TRUE,
        preparation_time_minutes INT,
        allergens TEXT[],
        popularity_score FLOAT DEFAULT 0,
        times_ordered INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
      CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
    `);

    // Reservations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id),
        table_id UUID REFERENCES tables(id),
        guest_count INT NOT NULL,
        reservation_date DATE NOT NULL,
        reservation_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'arrived', 'completed', 'cancelled')),
        special_requests TEXT,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(255),
        arrival_time TIMESTAMP,
        waiter_notified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
      CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON reservations(table_id);
      CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, reservation_time);
      CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
    `);

    // Orders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        table_id UUID REFERENCES tables(id),
        reservation_id UUID REFERENCES reservations(id),
        customer_id UUID REFERENCES customers(id),
        waiter_id UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
        order_type VARCHAR(50) DEFAULT 'dine_in',
        total_amount DECIMAL(12, 2),
        discount DECIMAL(12, 2) DEFAULT 0,
        special_notes TEXT,
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP,
        ready_at TIMESTAMP,
        served_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);
    `);

    // Order Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id UUID NOT NULL REFERENCES menu_items(id),
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
        special_instructions TEXT,
        prepared_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
    `);

    // Split Bills
    await pool.query(`
      CREATE TABLE IF NOT EXISTS split_bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        split_number INT NOT NULL,
        customer_name VARCHAR(255),
        amount DECIMAL(12, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_id, split_number)
      );
      CREATE INDEX IF NOT EXISTS idx_split_bills_order_id ON split_bills(order_id);
    `);

    // Reservations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id),
        table_id UUID REFERENCES tables(id),
        guest_count INT NOT NULL,
        reservation_date DATE NOT NULL,
        reservation_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'arrived', 'completed', 'cancelled')),
        special_requests TEXT,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(255),
        arrival_time TIMESTAMP,
        waiter_notified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
      CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON reservations(table_id);
      CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, reservation_time);
      CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
    `);

    // Payments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id),
        split_bill_id UUID REFERENCES split_bills(id),
        amount DECIMAL(12, 2) NOT NULL,
        method VARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'mobile')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        reference_number VARCHAR(255),
        fraud_score FLOAT DEFAULT 0,
        fraud_risk_level VARCHAR(50) DEFAULT 'low' CHECK (fraud_risk_level IN ('low', 'medium', 'high', 'critical')),
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);

    // Waiter Performance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waiter_performance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        waiter_id UUID NOT NULL REFERENCES users(id),
        date DATE NOT NULL,
        tables_served INT DEFAULT 0,
        orders_delivered_on_time INT DEFAULT 0,
        total_orders INT DEFAULT 0,
        average_table_turnover_minutes FLOAT,
        total_tips DECIMAL(12, 2) DEFAULT 0,
        total_upsells DECIMAL(12, 2) DEFAULT 0,
        customer_satisfaction FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(waiter_id, date)
      );
      CREATE INDEX IF NOT EXISTS idx_waiter_perf_waiter_id ON waiter_performance(waiter_id);
      CREATE INDEX IF NOT EXISTS idx_waiter_perf_date ON waiter_performance(date);
    `);

    // Loyalty Points
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loyalty_points (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id),
        points INT NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        description TEXT,
        balance_after INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
    `);

    // Recommendations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id),
        menu_item_id UUID NOT NULL REFERENCES menu_items(id),
        reason VARCHAR(100),
        score FLOAT NOT NULL,
        shown_count INT DEFAULT 0,
        converted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(customer_id, menu_item_id)
      );
      CREATE INDEX IF NOT EXISTS idx_recommendations_customer_id ON recommendations(customer_id);
    `);

    // Audit Log
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id UUID,
        changes JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
    `);

    // Analytics Cache (for performance)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_type VARCHAR(100) NOT NULL,
        metric_date DATE NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(metric_type, metric_date)
      );
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  }
};

/**
 * Drop all tables (use with caution!)
 */
export const dropDatabase = async () => {
  try {
    console.log('⚠️  Dropping database tables...');
    await pool.query(`
      DROP TABLE IF EXISTS analytics_cache CASCADE;
      DROP TABLE IF EXISTS audit_log CASCADE;
      DROP TABLE IF EXISTS recommendations CASCADE;
      DROP TABLE IF EXISTS loyalty_points CASCADE;
      DROP TABLE IF EXISTS waiter_performance CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS split_bills CASCADE;
      DROP TABLE IF EXISTS reservations CASCADE;
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS menu_items CASCADE;
      DROP TABLE IF EXISTS tables CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('✅ All tables dropped');
  } catch (err) {
    console.error('❌ Error dropping tables:', err);
    throw err;
  }
};
