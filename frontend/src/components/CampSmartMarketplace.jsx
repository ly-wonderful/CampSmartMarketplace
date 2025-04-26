import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, DollarSign, Users, Filter, Map } from 'lucide-react';
import './CampSmartMarketplace.css';

const API_URL = 'http://localhost:5000/api';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export default function CampSmartMarketplace() {
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState('');
  const [priceRange, setPriceRange] = useState(500);
  const [dateRange, setDateRange] = useState('');
  const [maxDistance, setMaxDistance] = useState(30); // Default 30 miles
  
  const [featuredCamps, setFeaturedCamps] = useState([]);
  const [allCamps, setAllCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const interests = ["Adventure", "Technology", "Sports", "Arts", "Science", "Music", "Nature", "Leadership"];
  const ageRanges = ["5-7", "8-10", "11-13", "14-16", "17-18"];
  const dateRanges = ["June 2025", "July 2025", "August 2025"];
  
  const suggestionsRef = useRef(null);
  
  // Fetch location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (location.length < 3) {
        setLocationSuggestions([]);
        return;
      }
      
      try {
        const response = await fetch(
          `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(location)}&limit=5`
        );
        const data = await response.json();
        setLocationSuggestions(data);
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
      }
    };
    
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [location]);
  
  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLocationSelect = (suggestion) => {
    setLocation(suggestion.display_name);
    setShowSuggestions(false);
  };
  
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
      const queryParams = new URLSearchParams({
        address: location,
        interests: selectedInterests.join(','),
        maxPrice: priceRange,
        maxDistance: maxDistance
      });
      
      if (selectedAgeRange) {
        const [minAge, maxAge] = selectedAgeRange.split('-');
        queryParams.append('minAge', minAge);
        queryParams.append('maxAge', maxAge);
      }
      
      const response = await fetch(`${API_URL}/camps/filter?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered camps');
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
    <div className="marketplace">
      <div className="search-container">
        <div className="search-box">
          <div className="location-input">
            <MapPin className="search-icon" />
            <input
              type="text"
              placeholder="Enter your location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="location-suggestions" ref={suggestionsRef}>
                {locationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="suggestion-item"
                    onClick={() => handleLocationSelect(suggestion)}
                  >
                    {suggestion.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="distance-slider">
            <Map className="filter-icon" />
            <input
              type="range"
              min="1"
              max="100"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
            />
            <span>{maxDistance} mi</span>
          </div>
        </div>
        
        <div className="filters-row">
          {/* Interests Filter */}
          <div className="dropdown-container">
            <div className="filter-item">
              <Filter className="filter-icon" />
              <span>{selectedInterests.length ? `${selectedInterests.length} selected` : 'Interests'}</span>
            </div>
            <div className="dropdown-menu">
              <div className="interest-tags">
                {interests.map(interest => (
                  <div
                    key={interest}
                    className={`interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Age Range Filter */}
          <div className="filter-item">
            <Users className="filter-icon" />
            <select
              value={selectedAgeRange}
              onChange={(e) => setSelectedAgeRange(e.target.value)}
            >
              <option value="">Age Range</option>
              {ageRanges.map(range => (
                <option key={range} value={range}>{range} years</option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="filter-item price-filter">
            <DollarSign className="filter-icon" />
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="price-range"
            />
            <span>${priceRange}</span>
          </div>

          {/* Date Range Filter */}
          <div className="filter-item">
            <Calendar className="filter-icon" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="">Date Range</option>
              {dateRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          <button className="search-button" onClick={handleSearch}>
            <Search className="search-icon" />
            Search
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
                    <span className="camp-location-text">{camp.address}</span>
                    {camp.distance !== undefined && (
                      <span className="camp-distance">
                        ({camp.distance.toFixed(1)} mi away)
                      </span>
                    )}
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