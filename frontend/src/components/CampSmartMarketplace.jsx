import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, DollarSign, Users, Filter } from 'lucide-react';
import './CampSmartMarketplace.css';

const API_URL = 'http://localhost:5000/api';

export default function CampSmartMarketplace() {
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState('');
  const [priceRange, setPriceRange] = useState(500);
  const [dateRange, setDateRange] = useState('');
  
  const [featuredCamps, setFeaturedCamps] = useState([]);
  const [allCamps, setAllCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const interests = ["Adventure", "Technology", "Sports", "Arts", "Science", "Music", "Nature", "Leadership"];
  const ageRanges = ["5-7", "8-10", "11-13", "14-16", "17-18"];
  const dateRanges = ["June 2025", "July 2025", "August 2025"];
  
  // Fetch featured camps on component mount
  useEffect(() => {
    const fetchFeaturedCamps = async () => {
      try {
        const response = await fetch(`${API_URL}/camps/featured`);
        if (!response.ok) {
          throw new Error('Failed to fetch featured camps');
        }
        const data = await response.json();
        setFeaturedCamps(data);
      } catch (err) {
        setError(err.message);
      }
    };
    
    const fetchAllCamps = async () => {
      try {
        const response = await fetch(`${API_URL}/camps`);
        if (!response.ok) {
          throw new Error('Failed to fetch all camps');
        }
        const data = await response.json();
        setAllCamps(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedCamps();
    fetchAllCamps();
  }, []);
  
  // Handle search with filters
  const handleSearch = async () => {
    setLoading(true);
    try {
      // Parse age range
      let minAge, maxAge;
      if (selectedAgeRange) {
        [minAge, maxAge] = selectedAgeRange.split('-').map(Number);
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (location) queryParams.append('location', location);
      if (selectedInterests.length) queryParams.append('interests', selectedInterests.join(','));
      if (minAge) queryParams.append('minAge', minAge);
      if (maxAge) queryParams.append('maxAge', maxAge);
      if (priceRange) queryParams.append('maxPrice', priceRange);
      
      const response = await fetch(`${API_URL}/camps/filter?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to filter camps');
      }
      const data = await response.json();
      setAllCamps(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  if (error) {
    return <div style={{ color: '#dc2626', padding: '1rem' }}>Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">SummerCamp Explorer</h1>
        <p className="header-subtitle">Find the perfect summer camp for your child</p>
      </header>
      
      {/* Horizontal Filters */}
      <div className="filters-container">
        <div className="filters-row">
          {/* Location Filter */}
          <div className="filter-item">
            <MapPin className="filter-icon" />
            <input 
              type="text" 
              placeholder="Your location" 
              className="filter-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Interests Filter */}
          <div className="dropdown-container">
            <button className="filter-item">
              <Filter className="filter-icon" />
              <span>{selectedInterests.length ? `${selectedInterests.length} selected` : 'Interests'}</span>
            </button>
            <div className="dropdown-menu" style={{ width: '16rem' }}>
              <div className="interest-tags">
                {interests.map(interest => (
                  <button 
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`interest-tag ${
                      selectedInterests.includes(interest) 
                        ? 'selected' 
                        : 'not-selected'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="dropdown-container">
            <button className="filter-item">
              <Calendar className="filter-icon" />
              <span>{dateRange || 'When'}</span>
            </button>
            <div className="dropdown-menu">
              {dateRanges.map(date => (
                <div 
                  key={date} 
                  className="dropdown-item"
                  onClick={() => setDateRange(date)}
                >
                  {date}
                </div>
              ))}
            </div>
          </div>

          {/* Age Filter */}
          <div className="dropdown-container">
            <button className="filter-item">
              <Users className="filter-icon" />
              <span>{selectedAgeRange || 'Age Range'}</span>
            </button>
            <div className="dropdown-menu">
              {ageRanges.map(age => (
                <div 
                  key={age} 
                  className="dropdown-item"
                  onClick={() => setSelectedAgeRange(age)}
                >
                  {age} years
                </div>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-item price-filter">
            <div className="flex items-center">
              <DollarSign className="filter-icon" />
              <span>Up to ${priceRange}</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="1000" 
              step="50" 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="price-range"
            />
          </div>

          {/* Search Button */}
          <button 
            className="search-button"
            onClick={handleSearch}
          >
            <Search style={{ marginRight: '0.5rem', height: '1.25rem', width: '1.25rem' }} />
            Search Camps
          </button>
        </div>
      </div>
      
      {/* Featured Camps Section */}
      <section>
        <h2 className="section-title">Featured Summer Camps</h2>
        {loading ? (
          <div className="loading-message">Loading featured camps...</div>
        ) : (
          <div className="featured-camps">
            {featuredCamps.map(camp => (
              <div key={camp.id} className="camp-card">
                <img 
                  src={camp.image_url || "/api/placeholder/300/200"} 
                  alt={camp.name} 
                  className="camp-image" 
                />
                <div className="camp-content">
                  <div className="camp-header">
                    <h3 className="camp-title">{camp.name}</h3>
                    <span className="camp-category">{camp.category}</span>
                  </div>
                  <div className="camp-location">
                    <MapPin style={{ height: '1rem', width: '1rem', marginRight: '0.25rem' }} />
                    <span className="camp-location-text">{camp.location}</span>
                  </div>
                  <div className="camp-details">
                    <span className="camp-age">Ages {camp.min_age}-{camp.max_age}</span>
                    <span className="camp-price">${camp.price}/week</span>
                  </div>
                  <div className="camp-footer">
                    <div className="camp-rating">
                      <span className="rating-star">★</span>
                      <span className="rating-value">{camp.rating}</span>
                    </div>
                    <button className="view-button">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Main Camp Listings Section */}
      <section style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <h2 className="section-title">All Summer Camps</h2>
          <div className="sort-container">
            <span className="sort-label">Sort by:</span>
            <select className="sort-select">
              <option>Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-message">Loading camps...</div>
        ) : (
          <div className="camps-grid">
            {allCamps.map(camp => (
              <div key={camp.id} className="camp-card">
                <img 
                  src={camp.image_url || "/api/placeholder/300/200"} 
                  alt={camp.name} 
                  className="camp-image" 
                  style={{ height: '12rem' }}
                />
                <div className="camp-content">
                  <div className="camp-header">
                    <h3 className="camp-title">{camp.name}</h3>
                    <span className="camp-category">{camp.category}</span>
                  </div>
                  <div className="camp-location">
                    <MapPin style={{ height: '1rem', width: '1rem', marginRight: '0.25rem' }} />
                    <span className="camp-location-text">{camp.location}</span>
                  </div>
                  <div className="camp-details">
                    <span className="camp-age">Ages {camp.min_age}-{camp.max_age}</span>
                    <span className="camp-price">${camp.price}/week</span>
                  </div>
                  <div className="camp-footer">
                    <div className="camp-rating">
                      <span className="rating-star">★</span>
                      <span className="rating-value">{camp.rating}</span>
                    </div>
                    <button className="view-button">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}