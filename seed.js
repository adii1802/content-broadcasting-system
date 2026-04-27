require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool, initDB } = require('./src/config/db');

const seedDB = async () => {
  try {
    await initDB();
    
    console.log('Seeding database...');
    
    const principalPassword = await bcrypt.hash('principal123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data for a fresh seed (optional, but good for testing)
      await client.query('DELETE FROM users');
      
      await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['Alice Principal', 'alice@example.com', principalPassword, 'principal']
      );

      await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['Bob Teacher', 'bob@example.com', teacherPassword, 'teacher']
      );
      
      await client.query('COMMIT');
      console.log('Database seeded successfully!');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error during seeding transaction', err);
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    pool.end();
  }
};

seedDB();
