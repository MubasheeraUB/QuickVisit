-- QuickVisit Sample Data
-- Note: Passwords are bcrypt hashes
-- admin@quickvisit.com / admin123
-- mubasheera2002@gmail.com / tourist123

-- =============================================
-- USERS
-- =============================================
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin User', 'admin@quickvisit.com', '$2a$10$KQYXHHUVfqYJ3pPx0F3y7eRjmZ4Q9TtL5WnXKvNcRpZcGmLkPqJsK', '+91 9999999999', 'admin'),
('Mubasheera U B', 'mubasheera2002@gmail.com', '$2a$10$YQ7XHHUVfqYJ3pPx0F3y7eRjmZ4Q9TtL5WnXKvNcRpZcGmLkPqJsK', '+91 7025014923', 'tourist'),
('Rahul Sharma', 'rahul.sh@gmail.com', '$2a$10$YQ7XHHUVfqYJ3pPx0F3y7eRjmZ4Q9TtL5WnXKvNcRpZcGmLkPqJsK', '+91 9876543210', 'tourist'),
('Priya Menon', 'priya.m@gmail.com', '$2a$10$YQ7XHHUVfqYJ3pPx0F3y7eRjmZ4Q9TtL5WnXKvNcRpZcGmLkPqJsK', '+91 9988776655', 'tourist'),
('Ahmed Khan', 'ahmed.k@gmail.com', '$2a$10$YQ7XHHUVfqYJ3pPx0F3y7eRjmZ4Q9TtL5WnXKvNcRpZcGmLkPqJsK', '+91 9812345678', 'tourist'),
('Sarah Joseph', 'sarah.j@gmail.com', '$2a$10$YQ7XHHUVfqYJ3pPx0F3y7eRjmZ4Q9TtL5WnXKvNcRpZcGmLkPqJsK', '+91 8877665544', 'tourist');

-- =============================================
-- DESTINATIONS
-- =============================================
INSERT INTO destinations (name, location, description, adult_price, child_price, senior_price, opening_time, closing_time, daily_capacity, rating, qr_code_data) VALUES
('Taj Mahal', 'Agra, Uttar Pradesh', 'A UNESCO World Heritage Site and one of the Seven Wonders of the World. The Taj Mahal is an ivory-white marble mausoleum built by Shah Jahan in memory of his wife Mumtaz Mahal.', 50.00, 25.00, 30.00, '06:00:00', '18:30:00', 40000, 4.8, 'https://quickvisit.app/book/taj-mahal'),
('Gateway of India', 'Mumbai, Maharashtra', 'An arch-monument built in the early 20th century, overlooking the Arabian Sea. A major tourist attraction and historical landmark.', 50.00, 25.00, 30.00, '07:00:00', '20:00:00', 30000, 4.6, 'https://quickvisit.app/book/gateway-of-india'),
('Red Fort', 'Delhi', 'A historic fort that served as the main residence of the Mughal emperors. UNESCO World Heritage Site.', 50.00, 25.00, 30.00, '09:30:00', '16:30:00', 25000, 4.5, 'https://quickvisit.app/book/red-fort'),
('National Museum', 'New Delhi', 'One of the largest museums in India, with collections spanning over 5,000 years of Indian cultural heritage.', 50.00, 25.00, 30.00, '10:00:00', '18:00:00', 5000, 4.4, 'https://quickvisit.app/book/national-museum'),
('Kovalam Beach', 'Trivandrum, Kerala', 'A famous beach destination with three crescent-shaped beaches, lighthouse, and Ayurvedic spa centers.', 30.00, 15.00, 20.00, '06:00:00', '20:00:00', 10000, 4.7, 'https://quickvisit.app/book/kovalam-beach'),
('Padmanabhaswamy Temple', 'Trivandrum, Kerala', 'A historic Hindu temple dedicated to Lord Vishnu, known for its architectural grandeur and treasures.', 40.00, 20.00, 25.00, '03:30:00', '19:30:00', 15000, 4.9, 'https://quickvisit.app/book/padmanabhaswamy');

-- =============================================
-- SAMPLE BOOKINGS
-- =============================================
INSERT INTO bookings (booking_id, user_id, destination_id, adult_count, child_count, senior_count, total_visitors, visit_date, time_slot, subtotal, service_fee, total_amount, status) VALUES
('QV-TAJ-A8K2P9', 2, 1, 2, 1, 0, 3, '2026-05-20', '9:00 AM - 11:00 AM', 125.00, 5.00, 130.00, 'confirmed'),
('QV-GAT-B5M3Q1', 3, 2, 3, 2, 0, 5, '2026-05-19', '11:00 AM - 1:00 PM', 200.00, 5.00, 205.00, 'confirmed'),
('QV-RFT-C2N7R4', 4, 3, 2, 0, 0, 2, '2026-05-21', '2:00 PM - 4:00 PM', 100.00, 5.00, 105.00, 'pending'),
('QV-MUS-D9L4S6', 5, 4, 4, 0, 0, 4, '2026-05-22', '10:00 AM - 12:00 PM', 200.00, 5.00, 205.00, 'confirmed'),
('QV-BCH-E1P8T2', 6, 5, 4, 2, 0, 6, '2026-05-18', '4:00 PM - 6:00 PM', 150.00, 5.00, 155.00, 'cancelled'),
('QV-TPL-F3K9V8', 2, 6, 4, 0, 0, 4, '2026-05-25', '7:00 AM - 9:00 AM', 160.00, 5.00, 165.00, 'confirmed');

-- =============================================
-- SAMPLE PAYMENTS
-- =============================================
INSERT INTO payments (transaction_id, booking_id, user_id, amount, payment_method, payment_gateway, status) VALUES
('TXN-89234561', 1, 2, 130.00, 'UPI', 'PhonePe', 'success'),
('TXN-89234562', 2, 3, 205.00, 'Card', 'Razorpay', 'success'),
('TXN-89234563', 3, 4, 105.00, 'UPI', 'GPay', 'pending'),
('TXN-89234564', 4, 5, 205.00, 'Wallet', 'Paytm', 'success'),
('TXN-89234565', 5, 6, 155.00, 'UPI', 'BHIM', 'refunded'),
('TXN-89234566', 6, 2, 165.00, 'Card', 'Stripe', 'success');

-- =============================================
-- SAMPLE FEEDBACK
-- =============================================
INSERT INTO feedback (user_id, destination_id, booking_id, rating, comments) VALUES
(3, 2, 2, 5, 'Excellent service! The QR scan booking saved us almost 45 minutes of waiting. Highly recommended for families.'),
(4, 3, 3, 4, 'Very smooth booking experience. The digital ticket worked perfectly at the gate. Would appreciate more language options.'),
(5, 4, 4, 5, 'No more queues! This is exactly what tourist places needed. The interface is super easy to use.'),
(2, 1, 1, 5, 'Amazing experience at the Taj Mahal with QuickVisit. The whole booking took less than 2 minutes.');
