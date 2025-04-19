const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
testConnection();

// Routes
// Get all camps
app.get('/api/camps', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM camps');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured camps
app.get('/api/camps/featured', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM camps WHERE featured = 1');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching featured camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Filter camps
app.get('/api/camps/filter', async (req, res) => {
  try {
    const { location, interests, minAge, maxAge, maxPrice } = req.query;
    
    let query = 'SELECT * FROM camps WHERE 1=1';
    const params = [];
    
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    
    if (interests) {
      const interestArray = interests.split(',');
      query += ' AND category IN (?)';
      params.push(interestArray);
    }
    
    if (minAge) {
      query += ' AND min_age >= ?';
      params.push(minAge);
    }
    
    if (maxAge) {
      query += ' AND max_age <= ?';
      params.push(maxAge);
    }
    
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error filtering camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
