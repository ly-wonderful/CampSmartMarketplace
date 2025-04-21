CREATE TABLE camps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  min_age INT NOT NULL,
  max_age INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  rating DECIMAL(3, 1),
  image_url VARCHAR(255),
  featured BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

