const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./db');
const NodeGeocoder = require('node-geocoder');
const turf = require('@turf/turf');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize geocoder
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
testConnection();

// Helper function to calculate distance between two points
async function calculateDistance(userLocation, campLocation) {
  try {
    console.log('\nStarting distance calculation:');
    console.log('User location:', userLocation);
    console.log('Camp location:', campLocation);
    
    // Geocode user location
    console.log('Geocoding user location...');
    const userGeo = await geocoder.geocode(userLocation);
    console.log('User geocode result:', userGeo);
    if (!userGeo || userGeo.length === 0) {
      throw new Error('Could not geocode user location');
    }
    
    // Geocode camp location
    console.log('Geocoding camp location...');
    const campGeo = await geocoder.geocode(campLocation);
    console.log('Camp geocode result:', campGeo);
    if (!campGeo || campGeo.length === 0) {
      throw new Error('Could not geocode camp location');
    }
    
    // Create points
    const from = turf.point([userGeo[0].longitude, userGeo[0].latitude]);
    const to = turf.point([campGeo[0].longitude, campGeo[0].latitude]);
    console.log('Points created:', { from, to });
    
    // Calculate distance in miles
    const distance = turf.distance(from, to, { units: 'miles' });
    console.log('Calculated distance:', distance, 'miles');
    return distance;
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
}

// Routes
// Get all camps
app.get('/api/camps', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM csm.vw_camps');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured camps
app.get('/api/camps/featured', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM csm.vw_camps WHERE featured = 1');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching featured camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Filter camps with distance
app.get('/api/camps/filter', async (req, res) => {
  try {
    const { address, interests, minAge, maxAge, maxPrice, maxDistance } = req.query;
    console.log('Received query params:', { address, interests, minAge, maxAge, maxPrice, maxDistance });
    
    // First get all camps that match price filter
    let query = 'SELECT * FROM csm.vw_camps WHERE 1=1';
    const params = [];
    
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }
    
    console.log('Executing price filter query:', query);
    console.log('With parameters:', params);
    
    const [rows] = await pool.query(query, params);
    console.log('Found camps after price filter:', rows.length);
    
    // If maxDistance is provided, calculate distances and filter
    if (maxDistance && address) {
      const filteredCamps = [];
      for (const camp of rows) {
        try {
          console.log('\nCalculating distance for camp:', camp.name);
          console.log('From:', address);
          console.log('To:', camp.address);
          
          // Add retry logic for distance calculation
          let retries = 3;
          let distance = null;
          
          while (retries > 0 && distance === null) {
            try {
              distance = await calculateDistance(address, camp.address);
              console.log('Distance:', distance, 'miles');
            } catch (error) {
              console.error(`Error calculating distance (attempt ${4-retries}/3):`, error);
              retries--;
              if (retries === 0) {
                console.error('Failed to calculate distance after 3 attempts');
                continue;
              }
              // Wait 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (distance !== null && distance <= maxDistance) {
            camp.distance = distance;
            filteredCamps.push(camp);
          }
        } catch (error) {
          console.error(`Error processing camp ${camp.id}:`, error);
        }
      }
      console.log('\nFiltered camps by distance:', filteredCamps.length);
      res.json(filteredCamps);
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error('Error filtering camps:', error);
    // If it's a connection error, try to reconnect
    if (error.code === 'ECONNRESET') {
      try {
        await testConnection();
        res.status(500).json({ message: 'Connection error, please try again' });
      } catch (reconnectError) {
        res.status(500).json({ message: 'Database connection error' });
      }
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
