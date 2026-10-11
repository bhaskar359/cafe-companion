-- Café Companion Seed Data (8-12 Realistic Specialty Indian Café Menu Items)

INSERT INTO menu_items (id, name, description, price_paise, category, tags, is_available, image_url, roast_origin, cupping_score)
VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'South Indian Filter Coffee Frappé',
    'Dark roasted chicory blend shaken with whole dairy milk, chilled crushed ice, and topped with velvety organic palm jaggery foam.',
    19000,
    'specialty',
    ARRAY['veg', 'house-favorite', 'cold', 'under-200', 'chikmagalur'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIKA2bS52C7_sunXUmE9hNU_PybIy3l8UZ9pYR2khccjAFOpani9NNrTj7FMi7U7ZR5xXAr2OlPITVmv3WxMmvGIHZEjs2qMNHEoH_NIU2ew06Uzk9djJrUDAF0qUCgYuMERqO540m9D-OVhEHT3MK2zWJOyzilSnYHbuIOxJzWhDjeWIi5P7g47E3d7e1Uchu0xYYVRwtm-Y62h5ROKbz_dLhX04P9vQPZ_h9KMLUWYlCFb5R5E3',
    'Attikan Micro-Lot (Biligirirangana Hills)',
    86.5
),
(
    'a1000000-0000-0000-0000-000000000002',
    'Estate Pour-Over (Attikan)',
    'Chemex extraction with cupping notes of toasted almond, single-origin cacao nibs, and subtle wild black cherry sweetness.',
    22000,
    'specialty',
    ARRAY['vegan', 'sugar-free', 'hot', 'single-origin', 'attikan'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB45AJ2j5LGj1sBzRoLq3KeOy-IVtC2lEY3E7h2EtJBd-lq0wSB7YRSw3JA94CZ86rHvcXochLk_GwAH-bnrQ5Sd8enw7R_w0S_zlusdhXFoRK48ajClWeTAlDcSWK7BmetZOuhcrxIae4jnkPkbheYPIJ8YjSy0RgEnVin-v7L7xhh0LIpeLsTqC4z59DlpL_hyQhZOwbi0tu6cyR-LkEJHMddcqFa3573n6aC8OulJJIXHljYLY26',
    'Attikan Estate Yellow Honey Process',
    87.2
),
(
    'a1000000-0000-0000-0000-000000000003',
    'Saffron Cardamom Cold Brew',
    'Steeped slowly for 18 hours in cold mountain water, micro-infused with genuine Pampore saffron threads and fragrant Idukki green cardamom.',
    24000,
    'chai',
    ARRAY['veg', '18h-steep', 'cold', 'zero-waste-bottle', 'shevaroys'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCfwm0wD_SLsp5ZQVWtNCjyvF9eUvoPi0kzV2lmutELK5r9gRNz5oLBYdNbuLPfryzOGXMwL0tq0m-ryBGmEo_j82N_ofBWT14RO6FmWHxRYlyfPRRX9HOf9dqc0y-wkI-Pcu-N89uteNtwhLEhWnQjqdKAKlSXt1Fn95wDWmS4-XGH2W3foiQ_TjD6L-5OtTUFBd-J0aDJOqmqznPKj7G0DqKn53mQVyi3cIS5R9sK4TrfB8IAsYGN',
    'Shevaroys Single Estate & Pampore Saffron',
    88.0
),
(
    'a1000000-0000-0000-0000-000000000004',
    'Gunpowder Masala Cheese Toast',
    'Naturally fermented artisanal sourdough topped with melted aged cheddar, fragrant fresh curry leaf tempered butter, and spiced podi masala.',
    26000,
    'small-plates',
    ARRAY['veg', 'chefs-pick', 'artisan-bread', 'breakfast', 'sourdough'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAHuejyGXSIhAE6aBRwS-KW3YQ0BNXsaA8QF3ax7U-l80lVI0rJ_ui8j4c4SORbbs8KTvKnO3gx0NoNjE6bc4Qb0KYR0IMtLG80VV52eXcaf1NXDEeGJn-oKw1Kt7cNLmGlzjwyv_FjDLA68w9LsImkki54Bpi-bIHi9E3b8xWnQCY_zWQs2ahOjCYmZjGZAudaqpS_3J-_qpeqccUX1_-qF8tj2azV-M3DDaeqdSRSHEZx_iiPIBb6',
    'Artisanal Fermented Bakery',
    NULL
),
(
    'a1000000-0000-0000-0000-000000000005',
    'Jaggery Cold Coffee (Oat Milk)',
    'Double espresso shot shaken vigorously with barista-grade oat milk and unrefined raw Kolhapur sugarcane jaggery for caramel undertones.',
    19500,
    'specialty',
    ARRAY['vegan', 'oat-milk', 'unrefined-sugar', 'cold', 'under-200'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDFjnxvfL8Iz0nZ7l3fu1wEb3HPG0n-060F9tqlZY1pX73QVX5WX4hSARafYfTsnCrrQS4J3ninsrYLBHlpMwm2gVeONHpKELWe5NIrh8qHmECLxQ_12w1x2klM6afMwlA83rhdva6NxEis1jYfYbnQrAbmYFMUJZPnGL3RopWwgotuo9vH5tIVehSuuv-ovWYCzxP7qb6L1p7kfU3B3aFpDU9FgtiWnWCtqTk28nzZJOoEI6avCaip',
    'Araku Valley Natural Arabica',
    85.8
),
(
    'a1000000-0000-0000-0000-000000000006',
    'Millet & Dark Chocolate Tea Cake',
    'Slow-baked finger millet (Ragi) flour combined with pure single-origin Idukki 70% chocolate, crowned with sea salt flakes.',
    18000,
    'bakery',
    ARRAY['veg', 'gluten-free', 'kerala-cacao', 'low-sugar', 'under-200'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD4g8F6U8agYo8jub-WIBmB0nqN4DJXHNU478OkLmYeM51UWHR4lVyRQQ2VD9Wqs8_GLPC09nNReBcA5-2W7zSfGw1TaMgSNlMiyB_5O7d0g6uuHSej87Dc_Gxbkz98JbNY2N6SdOyawhAj-28-0NmLTWHz7_e7vOO7sqEANU88vWGwnAecn9q6y9-G55hM_1GrB8RtitFtwE7Ug3LO5UoxPYCDYT9Wt0DJqkc_K8opaTagL3R6v1NI',
    'Idukki 70% Single Origin Cocoa',
    NULL
),
(
    'a1000000-0000-0000-0000-000000000007',
    'Monsooned Malabar Cold Brew',
    '18-hour Dutch drip cold extraction from Malabar coast washed beans with low natural acidity and gentle nutty sweetness.',
    21000,
    'specialty',
    ARRAY['vegan', 'cold', 'low-acidity', 'sugar-free', 'dutch-drip'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCPee7Rtc_EmjPFFMNa0mxR1dh1gRaRS3TMOqyZGDZcO8LchDpCzOWN1hIhTD7GrwETD-k_u4T3HLsp2mvnH5JYafe6NJ9LIGekABlVdEmel-sQUejdY873L9jku2wmA5KkhQ3vnFGQqoB6X7n95jkxlXXA0OqfJjqDRa4fsxq4JVjTvzAufoIv-C6vLyus9x_lMdm1syQ6iYpFzExZrHebass9KCytXIKKww7gR2nKaxvK9aApwvYK',
    'Malabar Coast Historic Roastery',
    86.0
),
(
    'a1000000-0000-0000-0000-000000000008',
    'Cardamom Pistachio Croissant',
    'Pure butter sourdough twice-baked pastry sprinkled with vibrant crushed Iranian pistachios and roasted Coorg cardamom seeds.',
    16000,
    'bakery',
    ARRAY['veg', 'pastry', 'warm', 'butter-laminated', 'under-200'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuASZO8InaIDYadSKseEtIOkqCNUUi7hFfYixQt3h7pUTcg5GzL5DgzyrfGMm1mrKMoDVz1KdIc8cXNpRj-nNJlKF-bTFjwujLiJK40EvPGR4mWCTM9p0_1zaswwjadK9cRD5WuQmDPpor0eCPtpoiJdr1iGD0vboxodpger6MIjB56Ro3wEvGvoD5lYz8DkO8mM2YjH1mmCihMrCQdc3hpmwpGdbZVNrsI_dKujKCE0luwZaBq3brL-',
    'Morning Viennoiserie Kitchen',
    NULL
),
(
    'a1000000-0000-0000-0000-000000000009',
    'Iced Americano',
    'Toasted almond aroma, balanced orange zest finish, and zero refined sugar. Clean double shot espresso over crystal rock ice.',
    17500,
    'specialty',
    ARRAY['vegan', 'sugar-free', 'cold', 'under-200', '84+ specialty'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCtHSxzNZabW1cjQmBNeRZb7bRZwLyVuCLzaSyt8KbNRpfbpO2Mzi-0ewqaoZ69Dan03IJS6SOamjFKG32Ta9xR-DdAYNTS2WQPHYCFCWXBmgWBuM88g8_Y6OM42x8cIc-Qj85YGRU4IK_UuOgewehyd1avaGFuKIJt7npUNDFBMJhdTmCoNVCKYXobnzjWzJr2srHLBsObCsZn2h2C_Pn3IFFsF49wTqk3iWPpV1hda9_MF50nPPSQ',
    'Chikmagalur Medium Roast',
    85.0
),
(
    'a1000000-0000-0000-0000-000000000010',
    'Roasted Almond Biscotti',
    'Twice-baked crunchy almond cookie infused with orange zest and wild fennel, perfect for dipping into pour-overs and cold brews.',
    6000,
    'bakery',
    ARRAY['veg', 'pairing-snack', 'under-200', 'biscotti'],
    true,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCPdM3hzDw0nNWnRYmohfdf4_ZBJuT8984aM-u_y_H5CU1Dt32uadXGBbQDF_ManhJw_RjkzP8Vtx5xgINOtNCwJ3-9m36DJxZtovVK91Z5Y9PyT_PUoJ7aRv6CvGZUp7m7e23jbmkWnev9Q5qfUYDT_iFgJqiwS0ZAmjAULFfkZop9s3QKhhLoPPnxM-K1hnEA0N_DIj35cQXs3cbbWuYvcFObrHkuO7XC9Xz7Vf7nXEe01ybUrMBS',
    'House Bakehouse',
    NULL
)
ON CONFLICT (id) DO NOTHING;
