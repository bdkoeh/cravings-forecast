-- SF Cravings Forecast - Seed Data
-- Normalized schema with lookup tables for cuisines and neighborhoods

-- Seed neighborhoods (26 SF neighborhoods)
INSERT INTO neighborhoods (name) VALUES ('Mission');
INSERT INTO neighborhoods (name) VALUES ('Marina');
INSERT INTO neighborhoods (name) VALUES ('Sunset');
INSERT INTO neighborhoods (name) VALUES ('Richmond');
INSERT INTO neighborhoods (name) VALUES ('Castro');
INSERT INTO neighborhoods (name) VALUES ('Haight');
INSERT INTO neighborhoods (name) VALUES ('SoMa');
INSERT INTO neighborhoods (name) VALUES ('Nob Hill');
INSERT INTO neighborhoods (name) VALUES ('Chinatown');
INSERT INTO neighborhoods (name) VALUES ('North Beach');
INSERT INTO neighborhoods (name) VALUES ('Tenderloin');
INSERT INTO neighborhoods (name) VALUES ('Hayes Valley');
INSERT INTO neighborhoods (name) VALUES ('Pacific Heights');
INSERT INTO neighborhoods (name) VALUES ('Potrero Hill');
INSERT INTO neighborhoods (name) VALUES ('Bernal Heights');
INSERT INTO neighborhoods (name) VALUES ('Noe Valley');
INSERT INTO neighborhoods (name) VALUES ('Excelsior');
INSERT INTO neighborhoods (name) VALUES ('Bayview');
INSERT INTO neighborhoods (name) VALUES ('Outer Sunset');
INSERT INTO neighborhoods (name) VALUES ('Inner Sunset');
INSERT INTO neighborhoods (name) VALUES ('Outer Richmond');
INSERT INTO neighborhoods (name) VALUES ('Inner Richmond');
INSERT INTO neighborhoods (name) VALUES ('Dogpatch');
INSERT INTO neighborhoods (name) VALUES ('Financial District');
INSERT INTO neighborhoods (name) VALUES ('Japantown');
INSERT INTO neighborhoods (name) VALUES ('Western Addition');

-- Seed cuisines
INSERT INTO cuisines (name) VALUES ('Bakery');
INSERT INTO cuisines (name) VALUES ('Ice Cream');
INSERT INTO cuisines (name) VALUES ('Chinese');
INSERT INTO cuisines (name) VALUES ('Burmese');
INSERT INTO cuisines (name) VALUES ('Seafood');
INSERT INTO cuisines (name) VALUES ('Mexican');
INSERT INTO cuisines (name) VALUES ('American');
INSERT INTO cuisines (name) VALUES ('Cafe');
INSERT INTO cuisines (name) VALUES ('Korean');
INSERT INTO cuisines (name) VALUES ('Japanese');
INSERT INTO cuisines (name) VALUES ('Italian');
INSERT INTO cuisines (name) VALUES ('Vietnamese');
INSERT INTO cuisines (name) VALUES ('Thai');
INSERT INTO cuisines (name) VALUES ('Indian');

-- Seed restaurants using IDs from above
-- Neighborhoods: 1=Mission, 2=Marina, 9=Chinatown, 20=Inner Sunset, 21=Outer Richmond, 22=Inner Richmond, 26=Western Addition
-- Cuisines: 1=Bakery, 2=Ice Cream, 3=Chinese, 4=Burmese, 5=Seafood, 6=Mexican, 7=American, 8=Cafe

-- 1. Tartine Bakery (Mission, Bakery) - foggy, night
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description, highlighted)
VALUES ('Tartine Bakery', 'https://tartinebakery.com', 1, 1, 'The croissants are a religious experience. Go early or suffer.', 1);
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (1, 'foggy');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (1, 'night');

-- 2. Bi-Rite Creamery (Mission, Ice Cream) - sunny
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description)
VALUES ('Bi-Rite Creamery', 'https://biritecreamery.com', 1, 2, 'Salted caramel in a waffle cone while people-watching at Dolores Park.');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (2, 'sunny');

-- 3. Ton Kiang (Outer Richmond, Chinese) - foggy
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description)
VALUES ('Ton Kiang', 'https://tonkiang.net', 21, 3, 'Dim sum so good you''ll forget you''re in the fog belt.');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (3, 'foggy');

-- 4. Burma Superstar (Inner Richmond, Burmese) - night, foggy
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description, highlighted)
VALUES ('Burma Superstar', 'https://burmasuperstar.com', 22, 4, 'Tea leaf salad that will ruin all other salads for you forever.', 1);
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (4, 'night');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (4, 'foggy');

-- 5. Hog Island Oyster Co (Marina, Seafood) - sunny
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description, highlighted)
VALUES ('Hog Island Oyster Co', 'https://hogislandoysters.com', 2, 5, 'Oysters and a view of the bay. Peak SF energy.', 1);
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (5, 'sunny');

-- 6. House of Nanking (Chinatown, Chinese) - night
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description)
VALUES ('House of Nanking', NULL, 9, 3, 'Let them order for you. Trust the process.');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (6, 'night');

-- 7. Nopalito (Western Addition, Mexican) - foggy, sunny
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description)
VALUES ('Nopalito', 'https://nopalitosf.com', 26, 6, 'Organic Mexican food that takes itself exactly seriously enough.');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (7, 'foggy');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (7, 'sunny');

-- 8. Nopa (Western Addition, American) - sunny, night
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description, highlighted)
VALUES ('Nopa', 'https://nopasf.com', 26, 7, 'Late night flatbread at the bar is peak San Francisco dining.', 1);
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (8, 'sunny');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (8, 'night');

-- 9. San Tung (Inner Sunset, Chinese) - night, foggy
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description)
VALUES ('San Tung', 'https://santung.net', 20, 3, 'Dry-fried chicken wings that are worth the 45-minute wait. Every. Single. Time.');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (9, 'night');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (9, 'foggy');

-- 10. Dolores Park Cafe (Mission, Cafe) - sunny
INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description)
VALUES ('Dolores Park Cafe', 'https://doloresparkcafe.com', 1, 8, 'Grab a breakfast burrito and claim your spot on the hill before everyone else does.');
INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (10, 'sunny');

-- Seed condition metadata
INSERT INTO condition_meta (condition, tag, description) VALUES ('foggy', 'CZY', 'Fog-proof Comfort Foods');
INSERT INTO condition_meta (condition, tag, description) VALUES ('sunny', 'SNY', 'Grab a Spot in the Sun');
INSERT INTO condition_meta (condition, tag, description) VALUES ('night', 'NTE', 'Evening Out in the City');

-- Seed crawl messages
INSERT INTO crawl_messages (message, sort_order, active) VALUES ('Did you know? Karl the Fog has his own Instagram account.', 1, 1);
INSERT INTO crawl_messages (message, sort_order, active) VALUES ('Pro tip: The best burritos are in the Mission. This is not up for debate.', 2, 1);
INSERT INTO crawl_messages (message, sort_order, active) VALUES ('Foggy days call for wonton soup and a window seat.', 3, 1);
INSERT INTO crawl_messages (message, sort_order, active) VALUES ('Sunny days in SF are earned. Celebrate with ice cream at Bi-Rite.', 4, 1);
INSERT INTO crawl_messages (message, sort_order, active) VALUES ('Windy day? Hunker down with dim sum in the Richmond.', 5, 1);
