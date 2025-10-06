// products.js

// Main array containing all product objects
const products = [
    {
        id: 'prod001',
        name: 'Organic Apples',
        category: 'fruits',
        price: 2.99,
        unit: '/ lb',
        description: 'Crisp and sweet organic Fuji apples. Perfect for snacking, baking, or adding to salads.',
        imageSrc: 'https://images.pexels.com/photos/209339/pexels-photo-209339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod002',
        name: 'Fresh Bananas',
        category: 'fruits',
        price: 0.59,
        unit: '/ lb',
        description: 'Naturally ripened fresh bananas. Great for smoothies, baking, or healthy snacks.',
        imageSrc: 'https://images.pexels.com/photos/2875814/pexels-photo-2875814.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod003',
        name: 'Organic Spinach',
        category: 'vegetables',
        price: 3.50,
        unit: '/ bag',
        description: 'Fresh organic baby spinach leaves. Ideal for salads, sautés, and smoothies.',
        imageSrc: 'https://images.pexels.com/photos/1751149/pexels-photo-1751149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod004',
        name: 'Whole Milk',
        category: 'dairy',
        price: 3.49,
        unit: '/ gallon',
        description: 'Fresh whole milk, grade A pasteurized. Rich, creamy taste perfect for drinking and cooking.',
        imageSrc: 'https://images.pexels.com/photos/2198626/pexels-photo-2198626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod005',
        name: 'Potato Chips',
        category: 'snacks',
        price: 2.50,
        unit: '',
        description: 'Classic salted potato chips, crispy. A perfect snack for parties or everyday munching.',
        imageSrc: 'https://images.pexels.com/photos/479628/pexels-photo-479628.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod006',
        name: 'Organic Carrots',
        category: 'vegetables',
        price: 1.99,
        unit: '/ bag',
        description: 'Sweet and crunchy organic carrots. Great for snacking, roasting, or juicing.',
        imageSrc: 'https://images.pexels.com/photos/6631952/pexels-photo-6631952.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod007',
        name: 'Cheddar Cheese',
        category: 'dairy',
        price: 4.75,
        unit: '/ block',
        description: 'Sharp cheddar cheese block, 8oz. Perfect for sandwiches, platters, or melting.',
        imageSrc: 'https://images.pexels.com/photos/139746/pexels-photo-139746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod008',
        name: 'Whole Wheat Bread',
        category: 'bakery',
        price: 3.20,
        unit: '/ loaf',
        description: 'Sliced whole wheat sandwich bread. Rich in fiber and perfect for healthy meals.',
        imageSrc: 'https://images.pexels.com/photos/1209029/pexels-photo-1209029.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod009',
        name: 'Strawberries',
        category: 'fruits',
        price: 4.50,
        unit: '/ pint',
        description: 'Fresh, juicy local strawberries. Great for desserts, smoothies, and snacking.',
        imageSrc: 'https://images.pexels.com/photos/2820144/pexels-photo-2820144.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod010',
        name: 'Greek Yogurt',
        category: 'dairy',
        price: 1.25,
        unit: '/ cup',
        description: 'Plain Greek yogurt, high protein. Creamy and tangy, perfect for a healthy diet.',
        imageSrc: 'https://images.pexels.com/photos/414262/pexels-photo-414262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
        id: 'prod011',
        name: 'Broccoli Florets',
        category: 'vegetables',
        price: 2.75,
        unit: '/ bag',
        description: 'Fresh cut broccoli florets, ready to cook. Great for steaming, roasting, or stir-fry.',
        imageSrc: 'https://media.istockphoto.com/id/1301178557/photo/raw-broccoli-in-hand-vegeterian-food-or-diet-concept.jpg?b=1&s=612x612&w=0&k=20&c=AOpHjcHYH5-Be6fTAxtGxSFjODf_beYeAax1qTlMlKk='
    },
    {
        id: 'prod012',
        name: 'Chocolate Chip Cookies',
        category: 'bakery',
        price: 5.50,
        unit: '/ dozen',
        description: 'Classic bakery-style chocolate chip cookies. Soft, chewy, and loaded with chocolate chips.',
        imageSrc: 'https://images.pexels.com/photos/3250406/pexels-photo-3250406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
];



// Array containing the IDs of bestseller products
// These IDs should correspond to the 'id' field in the 'products' array above
const bestsellerIds = [
    'prod001', // Organic Apples
    'prod004', // Whole Milk
    'prod008', // Whole Wheat Bread
    'prod011', // Broccoli Florets
    'prod005'  // Potato Chips
];

console.log("products.js loaded successfully."); // Optional: confirmation