-- Script runs when spring.sql.init.mode=always
-- Check if tables exist first to prevent errors during initialization

-- Insert test users if not exist (password is 'password123' encrypted with BCrypt)
INSERT INTO users (email, password, first_name, last_name, role)
SELECT 'customer@example.com', '$2a$10$OwUgTxwOAS2R6iWAcjS3ue9v56wq3oPFtODNz.IBqg7QpZ0bJ.RQ2', 'John', 'Doe', 'CUSTOMER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@example.com');

INSERT INTO users (email, password, first_name, last_name, role)
SELECT 'restaurant@example.com', '$2a$10$OwUgTxwOAS2R6iWAcjS3ue9v56wq3oPFtODNz.IBqg7QpZ0bJ.RQ2', 'Restaurant', 'Owner', 'RESTAURANT_STAFF'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'restaurant@example.com');

INSERT INTO users (email, password, first_name, last_name, role)
SELECT 'delivery@example.com', '$2a$10$OwUgTxwOAS2R6iWAcjS3ue9v56wq3oPFtODNz.IBqg7QpZ0bJ.RQ2', 'Delivery', 'Driver', 'DELIVERY_PERSONNEL'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'delivery@example.com');