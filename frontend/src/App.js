import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CampSmartMarketplace from './components/CampSmartMarketplace';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <Link to="/" className="logo">CampSmart</Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/camps">Find Camps</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<CampSmartMarketplace />} />
            <Route path="/camps" element={<CampSmartMarketplace />} />
            <Route path="/about" element={<div>About Page Coming Soon</div>} />
            <Route path="/contact" element={<div>Contact Page Coming Soon</div>} />
          </Routes>
        </main>

        <footer>
          <div className="footer-content">
            <p>&copy; 2024 CampSmart. All rights reserved.</p>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;