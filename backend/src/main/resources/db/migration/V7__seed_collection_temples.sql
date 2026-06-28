-- ─── New temples for collections ──────────────────────────────────────────────
INSERT INTO temples (name, deity, city, district, state, category, latitude, longitude, verification_radius, image_url, thumbnail_url, description)
VALUES
-- Jyotirlingas (not yet seeded)
('Mallikarjuna',    'Lord Shiva', 'Srisailam',      'Nandyal',     'Andhra Pradesh', 'Jyotirlinga',  16.0739, 78.8683, 750,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Mallikarjuna',    'https://placehold.co/120x120/E8A33D/1E2A78?text=Mallikarjuna',    'Sacred Jyotirlinga atop the Nallamala Hills by the Krishna river.'),
('Mahakaleshwar',   'Lord Shiva', 'Ujjain',         'Ujjain',      'Madhya Pradesh', 'Jyotirlinga',  23.1828, 75.7682, 500,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Mahakaleshwar',   'https://placehold.co/120x120/E8A33D/1E2A78?text=Mahakaleshwar',   'The only Swayambhu (self-manifested) Jyotirlinga facing south.'),
('Omkareshwar',     'Lord Shiva', 'Omkareshwar',    'Khandwa',     'Madhya Pradesh', 'Jyotirlinga',  22.2411, 76.1504, 750,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Omkareshwar',     'https://placehold.co/120x120/E8A33D/1E2A78?text=Omkareshwar',     'Jyotirlinga on an island shaped like the Om symbol in the Narmada river.'),
('Bhimashankar',    'Lord Shiva', 'Bhimashankar',   'Pune',        'Maharashtra',    'Jyotirlinga',  19.0735, 73.5356, 750,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Bhimashankar',    'https://placehold.co/120x120/E8A33D/1E2A78?text=Bhimashankar',    'Ancient Jyotirlinga nestled in the Sahyadri hills, origin of the Bhima river.'),
('Trimbakeshwar',   'Lord Shiva', 'Trimbak',        'Nashik',      'Maharashtra',    'Jyotirlinga',  19.9310, 73.5303, 500,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Trimbakeshwar',   'https://placehold.co/120x120/E8A33D/1E2A78?text=Trimbakeshwar',   'Jyotirlinga at the source of the sacred Godavari river near Nashik.'),
('Vaidyanath',      'Lord Shiva', 'Deoghar',        'Deoghar',     'Jharkhand',      'Jyotirlinga',  24.4854, 86.6945, 750,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Vaidyanath',      'https://placehold.co/120x120/E8A33D/1E2A78?text=Vaidyanath',      'One of the twelve Jyotirlingas, believed to cure all ailments of devotees.'),
('Nageshwar',       'Lord Shiva', 'Dwarka',         'Dwarka',      'Gujarat',        'Jyotirlinga',  22.3288, 69.0898, 750,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Nageshwar',       'https://placehold.co/120x120/E8A33D/1E2A78?text=Nageshwar',       'Jyotirlinga near Dwarka symbolising the lord of all nagas (serpents).'),
('Grishneshwar',    'Lord Shiva', 'Aurangabad',     'Aurangabad',  'Maharashtra',    'Jyotirlinga',  19.8747, 75.1790, 500,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Grishneshwar',    'https://placehold.co/120x120/E8A33D/1E2A78?text=Grishneshwar',    'The last of the twelve Jyotirlingas, located near the Ellora Caves.'),
-- Char Dham (Yamunotri and Gangotri not yet seeded)
('Yamunotri',       'Goddess Yamuna', 'Janki Chatti', 'Uttarkashi', 'Uttarakhand',  'Char Dham',    31.0152, 78.4525, 1000,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Yamunotri',       'https://placehold.co/120x120/E8A33D/1E2A78?text=Yamunotri',       'Source of the Yamuna river, first dhaam in the Chota Char Dham yatra.'),
('Gangotri',        'Goddess Ganga', 'Gangotri',     'Uttarkashi', 'Uttarakhand',   'Char Dham',    30.9952, 78.9345, 1000,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Gangotri',        'https://placehold.co/120x120/E8A33D/1E2A78?text=Gangotri',        'Origin of the sacred Ganges river at 3048m in the Himalayas.'),
-- Panch Bhoota Sthalas
('Ekambareswarar',  'Lord Shiva', 'Kanchipuram',    'Kanchipuram', 'Tamil Nadu',     'Panch Bhoota', 12.8474, 79.7028, 500,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Ekambareswarar',  'https://placehold.co/120x120/E8A33D/1E2A78?text=Ekambareswarar',  'Prithvi (Earth) Sthalas — one of the largest temple complexes in India.'),
('Jambukeswarar',   'Lord Shiva', 'Thiruvanaikaval','Tiruchirappalli','Tamil Nadu',  'Panch Bhoota', 10.8525, 78.7051, 500,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Jambukeswarar',   'https://placehold.co/120x120/E8A33D/1E2A78?text=Jambukeswarar',   'Appu (Water) Sthalas — the sanctum has a natural spring of holy water.'),
('Arunachaleswarar','Lord Shiva', 'Thiruvannamalai','Thiruvannamalai','Tamil Nadu',  'Panch Bhoota', 12.2316, 79.0667, 750,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Arunachaleswarar','https://placehold.co/120x120/E8A33D/1E2A78?text=Arunachaleswarar','Tejas (Fire) Sthalas — the sacred Arunachala Hill is considered Shiva himself.'),
('Kalahasteeswara', 'Lord Shiva', 'Srikalahasti',   'Chittoor',    'Andhra Pradesh', 'Panch Bhoota', 13.7499, 79.6994, 500,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Kalahasteeswara', 'https://placehold.co/120x120/E8A33D/1E2A78?text=Kalahasteeswara', 'Vayu (Air) Sthalas — the lamp in the sanctum flickers due to the air element.'),
('Nataraja',        'Lord Shiva', 'Chidambaram',    'Chidambaram', 'Tamil Nadu',     'Panch Bhoota', 11.3990, 79.6939, 500,
    'https://placehold.co/800x400/E8A33D/1E2A78?text=Nataraja',        'https://placehold.co/120x120/E8A33D/1E2A78?text=Nataraja',        'Akasha (Space) Sthalas — the sanctum represents the cosmic dance of Shiva.');

-- ─── Collections ──────────────────────────────────────────────────────────────
INSERT INTO collections (id, name, description, type, total_count) VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', '12 Jyotirlingas',      'The twelve sacred abodes of Lord Shiva across India.',          'JYOTIRLINGA',  12),
    ('aaaaaaaa-0000-0000-0000-000000000002', 'Char Dham',            'Four sacred pilgrimage sites blessed by Adi Shankaracharya.',   'CHAR_DHAM',     4),
    ('aaaaaaaa-0000-0000-0000-000000000003', 'Panch Bhoota Sthalas', 'Five Shiva temples representing the five classical elements.',  'PANCH_BHOOTA',  5);

-- ─── Jyotirlinga membership ───────────────────────────────────────────────────
INSERT INTO collection_temples (collection_id, temple_id)
SELECT 'aaaaaaaa-0000-0000-0000-000000000001', id FROM temples
WHERE name IN ('Somnath Temple','Mallikarjuna','Mahakaleshwar','Omkareshwar',
               'Kedarnath Temple','Bhimashankar','Kashi Vishwanath','Trimbakeshwar',
               'Vaidyanath','Nageshwar','Ramanathaswamy','Grishneshwar');

-- ─── Char Dham membership ─────────────────────────────────────────────────────
INSERT INTO collection_temples (collection_id, temple_id)
SELECT 'aaaaaaaa-0000-0000-0000-000000000002', id FROM temples
WHERE name IN ('Yamunotri','Gangotri','Kedarnath Temple','Badrinath Temple');

-- ─── Panch Bhoota membership ──────────────────────────────────────────────────
INSERT INTO collection_temples (collection_id, temple_id)
SELECT 'aaaaaaaa-0000-0000-0000-000000000003', id FROM temples
WHERE name IN ('Ekambareswarar','Jambukeswarar','Arunachaleswarar','Kalahasteeswara','Nataraja');
