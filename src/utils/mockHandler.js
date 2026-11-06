import { mockSiteSettings, mockCategories, mockHealthTips, mockProducts } from '../data/mockData';

export const mockFaqs = [
    {
        id: 1,
        question: "Are all medications at VitalCare Pharmacy authentic?",
        answer: "Yes, 100%. All medicines in our inventory are directly sourced from licensed pharmaceutical distributors and manufacturers, complying with full FDA regulatory standards."
    },
    {
        id: 2,
        question: "How do prescription-only medications work?",
        answer: "For medications labeled 'Requires Prescription', our checkout system prompts you to take or upload a photo of your valid doctor's prescription. Our licensed pharmacists verify it before dispatch."
    },
    {
        id: 3,
        question: "What are your delivery hours and delivery areas?",
        answer: "We offer same-day express delivery across major metropolitan zones for orders placed before 3:00 PM. Standard delivery arrives within 24 to 48 hours."
    },
    {
        id: 4,
        question: "How does the Chronic Medication Refill reminder work?",
        answer: "For long-term prescriptions (such as blood pressure, diabetes, or cholesterol medications), you can enable recurring refills. We notify you before your supply runs low so you never miss a dose."
    },
    {
        id: 5,
        question: "What should I do if I experience unexpected side effects?",
        answer: "Stop taking the medicine immediately and consult your physician or emergency healthcare services. You can also reach our pharmacy helpline for guidance."
    }
];


export const mockDemoUsers = {
    'admin@vitalcare.com': {
        id: 1,
        name: 'System Admin',
        email: 'admin@vitalcare.com',
        role: 'admin',
        role_id: 1,
        gender: 'male',
        phone: '09123456789',
        address: 'Pharmacy Headquarters',
        profile: null,
        permissions: [
            'dashboard.view', 'products.crud', 'categories.crud', 'units.crud',
            'orders.manage', 'promotions.crud', 'inventory.manage', 'users.view',
            'users.delete', 'staff.manage', 'password.reset', 'health_tips.crud',
            'site_settings.manage', 'search.use', 'feedback.create', 'cart.use',
            'wishlist.use', 'orders.own', 'contact.submit', 'activity_logs.view'
        ]
    },
    'customer@vitalcare.com': {
        id: 2,
        name: 'John Customer',
        email: 'customer@vitalcare.com',
        role: 'user',
        role_id: 4,
        gender: 'male',
        phone: '09777777777',
        address: '123 Health Street, Wellness City',
        profile: null,
        permissions: ['search.use', 'feedback.create', 'cart.use', 'wishlist.use', 'orders.own', 'contact.submit']
    },
    'pharmacist@vitalcare.com': {
        id: 3,
        name: 'Dr. Phil Pharmacist',
        email: 'pharmacist@vitalcare.com',
        role: 'pharmacist',
        role_id: 3,
        gender: 'male',
        phone: '09888888888',
        address: 'Wellness Plaza, Suite 402',
        profile: null,
        permissions: [
            'dashboard.view', 'products.crud', 'categories.crud', 'units.crud',
            'inventory.manage', 'health_tips.crud', 'promotions.crud', 'orders.manage'
        ]
    },
    'staff@vitalcare.com': {
        id: 4,
        name: 'Sarah Staff',
        email: 'staff@vitalcare.com',
        role: 'staff',
        role_id: 2,
        gender: 'female',
        phone: '09555555555',
        address: 'Staff Quarters, Vital Care',
        profile: null,
        permissions: ['products.crud', 'categories.crud', 'units.crud', 'orders.manage', 'inventory.manage']
    }
};

export const mockCustomerOrders = [
    {
        id: 101,
        receipt_number: 'REC-2026-001',
        status: 'completed',
        payment_status: 'paid',
        payment_method: 'kpay',
        total_amount: '24500.00',
        delivery_address: '123 Health Street, Wellness City',
        delivery_phone: '09777777777',
        created_at: '2026-11-04T10:30:00.000000Z',
        user: {
            name: 'John Customer',
            email: 'customer@vitalcare.com',
            phone: '09777777777',
            address: '123 Health Street, Wellness City'
        },
        order_products: [
            {
                id: 1,
                quantity: 5,
                price: '1200.00',
                product: {
                    id: 1,
                    name: 'Biogesic 500mg (10 Tablets)',
                    primary_image_url: 'http://127.0.0.1:8000/storage/products/prod_1_biogesic_1.jpg'
                }
            },
            {
                id: 2,
                quantity: 2,
                price: '9250.00',
                product: {
                    id: 28,
                    name: 'Enervon C (30 Tablets)',
                    primary_image_url: 'http://127.0.0.1:8000/storage/products/prod_28_enervon_c.jpg'
                }
            }
        ]
    },
    {
        id: 102,
        receipt_number: 'REC-2026-002',
        status: 'processing',
        payment_status: 'paid',
        payment_method: 'wavepay',
        total_amount: '18000.00',
        delivery_address: '123 Health Street, Wellness City',
        delivery_phone: '09777777777',
        created_at: '2026-11-05T14:15:00.000000Z',
        user: {
            name: 'John Customer',
            email: 'customer@vitalcare.com',
            phone: '09777777777',
            address: '123 Health Street, Wellness City'
        },
        order_products: [
            {
                id: 3,
                quantity: 2,
                price: '9000.00',
                product: {
                    id: 4,
                    name: 'Alaxan FR Capsule (10s)',
                    primary_image_url: 'http://127.0.0.1:8000/storage/products/prod_4_alaxan_1.jpg'
                }
            }
        ]
    }
];

export const mockDashboardData = {
    today_sales: 185000,
    yesterday_sales: 162000,
    sales_change: 14.2,
    today_profit: 45000,
    profit_change: 8.5,
    new_orders: 12,
    low_stock: 4,
    expiring_soon: 2,
    pending_password_resets: 0,
    recent_orders: [
        {
            id: 101,
            receipt_number: 'REC-2026-001',
            total_amount: '24500.00',
            status: 'completed',
            payment_status: 'paid',
            created_at: new Date().toISOString(),
            user: { name: 'John Customer', email: 'customer@vitalcare.com' }
        },
        {
            id: 102,
            receipt_number: 'REC-2026-002',
            total_amount: '18000.00',
            status: 'processing',
            payment_status: 'paid',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            user: { name: 'Aung Kyaw', email: 'aung@gmail.com' }
        },
        {
            id: 103,
            receipt_number: 'REC-2026-003',
            total_amount: '32000.00',
            status: 'completed',
            payment_status: 'paid',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            user: { name: 'Thida Swe', email: 'thida@gmail.com' }
        }
    ],
    recent_activity: [
        {
            id: 1,
            action: 'login',
            model: 'User',
            description: 'User logged in: System Admin (admin)',
            created_at: new Date().toISOString(),
            user: { name: 'System Admin' }
        },
        {
            id: 2,
            action: 'created',
            model: 'Order',
            description: 'New prescription order placed',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            user: { name: 'John Customer' }
        }
    ],
    total_products: 62,
    health_tips_count: 8,
    published_tips: 8,
    sales_trend: [
        { day: 'Mon', amount: 140000 },
        { day: 'Tue', amount: 180000 },
        { day: 'Wed', amount: 165000 },
        { day: 'Thu', amount: 210000 },
        { day: 'Fri', amount: 195000 },
        { day: 'Sat', amount: 250000 },
        { day: 'Sun', amount: 220000 }
    ],
    monthly_trend: [
        { month: 'Jun', amount: 3200000 },
        { month: 'Jul', amount: 3800000 },
        { month: 'Aug', amount: 4100000 },
        { month: 'Sep', amount: 4500000 },
        { month: 'Oct', amount: 4800000 },
        { month: 'Nov', amount: 5200000 }
    ],
    top_products: [
        { product: { name: 'Biogesic 500mg' }, total_revenue: 125000, total_qty: 250 },
        { product: { name: 'Alaxan FR' }, total_revenue: 98000, total_qty: 140 },
        { product: { name: 'Enervon C' }, total_revenue: 85000, total_qty: 95 },
        { product: { name: 'Decolgen Forte' }, total_revenue: 64000, total_qty: 160 },
        { product: { name: 'Appeton Lysine Syrup' }, total_revenue: 52000, total_qty: 28 }
    ],
    category_distribution: [
        { name: 'Pain Relief & Fever', count: 10 },
        { name: 'Cough, Cold & Flu', count: 11 },
        { name: 'Vitamins & Supplements', count: 14 },
        { name: 'Medical Supplies', count: 8 },
        { name: 'Digestive Health', count: 6 },
        { name: 'First Aid & Antiseptics', count: 7 }
    ]
};

function parseRequestBody(data) {
    if (!data) return {};
    if (typeof data === 'object') {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            const obj = {};
            data.forEach((val, key) => { obj[key] = val; });
            return obj;
        }
        return data;
    }
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    }
    return {};
}

function getAuthenticatedUser(config) {
    if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('vitalcare_mock_user');
        if (raw) {
            try { return JSON.parse(raw); } catch (e) {}
        }
    }
    const token = (config?.headers?.Authorization || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : '')) || '';
    if (token.includes('admin')) return mockDemoUsers['admin@vitalcare.com'];
    if (token.includes('pharmacist')) return mockDemoUsers['pharmacist@vitalcare.com'];
    if (token.includes('staff')) return mockDemoUsers['staff@vitalcare.com'];
    return mockDemoUsers['customer@vitalcare.com'];
}

export function handleMockRequest(config) {
    if (!config || !config.url) return null;

    let path = config.url
        .replace(/^https?:\/\/[^\/]+/, '') // strip domain
        .replace(/^\/api/, '');            // strip leading /api

    // Strip query parameters for path matching
    const [cleanPath, queryString] = path.split('?');
    const params = config.params || {};

    // 1. Site Settings
    if (cleanPath === '/site-settings') {
        return { data: mockSiteSettings, status: 200, statusText: 'OK', config, headers: {} };
    }

    // 2. Categories
    if (cleanPath === '/categories') {
        return { data: mockCategories, status: 200, statusText: 'OK', config, headers: {} };
    }

    // 3. Top Sellers
    if (cleanPath === '/products/top-sellers') {
        const top = mockProducts.slice(0, 10);
        return { data: top, status: 200, statusText: 'OK', config, headers: {} };
    }

    // 4. Special Offers
    if (cleanPath === '/products/special-offers') {
        // Return 6 items with sample promotions
        const offers = mockProducts.slice(4, 10).map((p, idx) => ({
            ...p,
            promotions: [
                {
                    id: idx + 1,
                    type: idx % 2 === 0 ? 'percentage' : 'fixed_amount',
                    discount_value: idx % 2 === 0 ? 15 : 500,
                    name: 'Seasonal Health Discount'
                }
            ]
        }));
        return { data: offers, status: 200, statusText: 'OK', config, headers: {} };
    }

    // 5. Single Product Detail: /products/:id
    const productDetailMatch = cleanPath.match(/^\/products\/(\d+)$/);
    if (productDetailMatch) {
        const id = parseInt(productDetailMatch[1], 10);
        const product = mockProducts.find(p => p.id === id) || mockProducts[0];
        const related = mockProducts
            .filter(p => p.category_id === product.category_id && p.id !== product.id)
            .slice(0, 5);
        return {
            data: { product, related },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 6. Products Catalog Listing: /products
    if (cleanPath === '/products') {
        let filtered = [...mockProducts];

        const catId = params.category_id || (queryString && new URLSearchParams(queryString).get('category_id'));
        if (catId) {
            filtered = filtered.filter(p => p.category_id === parseInt(catId, 10));
        }

        const search = params.search || (queryString && new URLSearchParams(queryString).get('search'));
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.category?.name && p.category.name.toLowerCase().includes(query))
            );
        }

        const type = params.type || (queryString && new URLSearchParams(queryString).get('type'));
        if (type === 'promotions') {
            filtered = filtered.filter((_, idx) => idx % 4 === 0);
        }

        const page = parseInt(params.page || (queryString && new URLSearchParams(queryString).get('page')) || 1, 10);
        const perPage = 12;
        const total = filtered.length;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        const start = (page - 1) * perPage;
        const pageItems = filtered.slice(start, start + perPage);

        return {
            data: {
                data: pageItems,
                current_page: page,
                last_page: lastPage,
                total: total,
                per_page: perPage
            },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 7. Single Health Tip Detail: /health-tips/:id
    const tipDetailMatch = cleanPath.match(/^\/health-tips\/(\d+)$/);
    if (tipDetailMatch) {
        const id = parseInt(tipDetailMatch[1], 10);
        const tip = mockHealthTips.find(t => t.id === id) || mockHealthTips[0];
        const related = mockHealthTips.filter(t => t.id !== tip.id).slice(0, 3);
        const popular = mockHealthTips.slice(0, 3);
        return {
            data: { tip, related, popular },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 8. Health Tips Listing: /health-tips
    if (cleanPath === '/health-tips') {
        return { data: mockHealthTips, status: 200, statusText: 'OK', config, headers: {} };
    }

    // 9. FAQs: /faqs
    if (cleanPath === '/faqs') {
        return { data: mockFaqs, status: 200, statusText: 'OK', config, headers: {} };
    }

    // 10. Cart: /auth/cart
    if (cleanPath === '/auth/cart') {
        return {
            data: { items: [], total: 0, subtotal: 0 },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 11. Wishlist: /auth/wishlist
    if (cleanPath === '/auth/wishlist') {
        return { data: [], status: 200, statusText: 'OK', config, headers: {} };
    }

    // 12. Global Autocomplete Search: /search?q=...
    if (cleanPath === '/search') {
        const query = (params.q || (queryString && new URLSearchParams(queryString).get('q')) || '').trim().toLowerCase();
        if (query.length < 2) {
            return { data: [], status: 200, statusText: 'OK', config, headers: {} };
        }

        // Match products (name, description, category)
        const matchedProducts = mockProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.category?.name && p.category.name.toLowerCase().includes(query))
        ).slice(0, 6).map(p => {
            const imgPath = p.pictures?.[0]?.image_path;
            const imgUrl = imgPath ? `/storage/${imgPath.replace(/^\//, '')}` : (p.image || null);
            return {
                id: p.id,
                type: 'product',
                name: p.name,
                description: (p.description || '').replace(/<[^>]*>?/gm, '').substring(0, 60) + '...',
                image: imgUrl,
                category: p.category?.name || 'Medicines',
                url: `/products/${p.id}`
            };
        });

        // Match health tips (title, content)
        const matchedTips = mockHealthTips.filter(t =>
            t.title.toLowerCase().includes(query) ||
            (t.content && t.content.toLowerCase().includes(query))
        ).slice(0, 4).map(t => {
            const tipImg = t.image_path ? (t.image_path.startsWith('http') ? t.image_path : `/storage/${t.image_path.replace(/^\//, '')}`) : null;
            return {
                id: t.id,
                type: 'healthtip',
                name: t.title,
                description: (t.content || '').replace(/<[^>]*>?/gm, '').substring(0, 60) + '...',
                image: tipImg,
                category: 'Health & Wellness',
                url: `/health-tips/${t.id}`
            };
        });

        return {
            data: [...matchedProducts, ...matchedTips],
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 13. Contact Submission: /contact
    if (cleanPath === '/contact') {
        return {
            data: { success: true, message: 'Thank you! Your message has been received.' },
            status: 201,
            statusText: 'Created',
            config,
            headers: {}
        };
    }

    // 14. Forgot Password: /auth/forgot-password
    if (cleanPath === '/auth/forgot-password') {
        return {
            data: { message: 'The admin will process your request and send you a new password via email.' },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 15. Force Password Change: /auth/force-change-password
    if (cleanPath === '/auth/force-change-password') {
        return {
            data: { message: 'Password updated successfully.' },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 16. Admin Alerts: /admin/notifications/alerts
    if (cleanPath === '/admin/notifications/alerts') {
        return {
            data: { alerts: [], count: 0 },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }


    // 17. Authentication: POST /auth/login
    if (cleanPath === '/auth/login') {
        const body = parseRequestBody(config.data);
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        let user = mockDemoUsers[email];
        if (!user && email.includes('@')) {
            user = {
                id: 99,
                name: email.split('@')[0],
                email: email,
                role: 'user',
                role_id: 4,
                gender: 'male',
                phone: '09777777777',
                address: '123 Health Street',
                profile: null,
                permissions: ['search.use', 'feedback.create', 'cart.use', 'wishlist.use', 'orders.own', 'contact.submit']
            };
        }

        if (!user) {
            return {
                data: {
                    error: 'Unauthorized',
                    message: 'User account not found. Please use demo account: admin@vitalcare.com or customer@vitalcare.com.'
                },
                status: 401,
                statusText: 'Unauthorized',
                config,
                headers: {}
            };
        }

        // Allow 'password123' or any 6+ length password for demo convenience
        if (password !== 'password123' && password.length < 6) {
            return {
                data: {
                    error: 'Unauthorized',
                    message: 'Invalid credentials. Please use "password123" for demo accounts.'
                },
                status: 401,
                statusText: 'Unauthorized',
                config,
                headers: {}
            };
        }

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('vitalcare_mock_user', JSON.stringify(user));
        }

        return {
            data: {
                access_token: 'mock-jwt-showcase-token-' + user.role,
                token_type: 'bearer',
                expires_in: 86400,
                user: user
            },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 18. Authentication: GET /auth/me
    if (cleanPath === '/auth/me') {
        const currentUser = getAuthenticatedUser(config);
        return {
            data: currentUser,
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 19. Authentication: POST /auth/logout
    if (cleanPath === '/auth/logout') {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('vitalcare_mock_user');
        }
        return {
            data: { message: 'Successfully logged out' },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 20. Authentication: POST /auth/register
    if (cleanPath === '/auth/register') {
        const body = parseRequestBody(config.data);
        const newUser = {
            id: Date.now(),
            name: body.name || 'New Customer',
            email: (body.email || '').trim().toLowerCase() || 'customer@vitalcare.com',
            role: 'user',
            role_id: 4,
            gender: body.gender || 'male',
            phone: body.phone || '09777777777',
            address: body.address || 'Demo Address',
            profile: null,
            permissions: ['search.use', 'feedback.create', 'cart.use', 'wishlist.use', 'orders.own', 'contact.submit']
        };
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('vitalcare_mock_user', JSON.stringify(newUser));
        }
        return {
            data: {
                access_token: 'mock-jwt-showcase-token-user',
                token_type: 'bearer',
                expires_in: 86400,
                user: newUser
            },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 21. Profile Update: POST /auth/profile or PUT /auth/profile
    if (cleanPath === '/auth/profile') {
        const body = parseRequestBody(config.data);
        const current = getAuthenticatedUser(config);
        const updated = {
            ...current,
            name: body.name || current.name,
            phone: body.phone || current.phone,
            address: body.address || current.address,
            gender: body.gender || current.gender
        };
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('vitalcare_mock_user', JSON.stringify(updated));
        }
        return {
            data: {
                status: 'success',
                message: 'Profile updated successfully',
                user: updated
            },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 22. Customer Orders: /auth/orders
    if (cleanPath === '/auth/orders') {
        return {
            data: mockCustomerOrders,
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 23. Customer Single Order: /auth/orders/:id
    const customerOrderMatch = cleanPath.match(/^\/auth\/orders\/(\d+)$/);
    if (customerOrderMatch) {
        const orderId = parseInt(customerOrderMatch[1], 10);
        const order = mockCustomerOrders.find(o => o.id === orderId) || mockCustomerOrders[0];
        return {
            data: order,
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 24. Customer Reorder: /auth/orders/:id/reorder
    if (cleanPath.match(/^\/auth\/orders\/(\d+)\/reorder$/)) {
        return {
            data: { success: true, message: 'Items re-added to cart successfully.' },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 25. Refill Reminders: /refill-reminders
    if (cleanPath === '/refill-reminders') {
        return {
            data: { data: [] },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 26. Admin Dashboard: /admin/dashboard
    if (cleanPath === '/admin/dashboard') {
        return {
            data: mockDashboardData,
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 27. Admin Users List: /admin/users
    if (cleanPath === '/admin/users') {
        return {
            data: Object.values(mockDemoUsers),
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 28. Admin Orders List: /admin/orders
    if (cleanPath === '/admin/orders') {
        return {
            data: {
                data: mockCustomerOrders,
                total: mockCustomerOrders.length,
                current_page: 1,
                last_page: 1
            },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 29. Admin Activity Logs: /admin/logs
    if (cleanPath === '/admin/logs') {
        return {
            data: mockDashboardData.recent_activity,
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 30. Admin Messages: /admin/messages
    if (cleanPath === '/admin/messages') {
        return {
            data: [
                {
                    id: 1,
                    name: 'Daw Khin Myint',
                    email: 'khinmyint@gmail.com',
                    subject: 'Medication Inquiry',
                    message: 'Do you have Biogesic in 100 tablet boxes available for delivery?',
                    created_at: new Date(Date.now() - 86400000).toISOString()
                }
            ],
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 31. Admin Units: /admin/units
    if (cleanPath === '/admin/units') {
        return {
            data: [
                { id: 1, name: 'Tablet', abbreviation: 'Tab' },
                { id: 2, name: 'Capsule', abbreviation: 'Cap' },
                { id: 3, name: 'Bottle', abbreviation: 'Btl' },
                { id: 4, name: 'Strip', abbreviation: 'Str' },
                { id: 5, name: 'Box', abbreviation: 'Box' }
            ],
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 32. Admin Suppliers: /admin/suppliers
    if (cleanPath === '/admin/suppliers') {
        return {
            data: [
                { id: 1, name: 'Mega Lifesciences Ltd.', contact_person: 'Mr. Vivek', phone: '09444444444' },
                { id: 2, name: 'United Pharma Co.', contact_person: 'Dr. Win', phone: '09333333333' }
            ],
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 33. Admin Promotions: /admin/promotions
    if (cleanPath === '/admin/promotions') {
        return {
            data: [
                {
                    id: 1,
                    title: 'Monsoon Wellness Campaign',
                    type: 'percentage',
                    discount_value: 15,
                    start_date: '2026-11-01',
                    end_date: '2026-11-30',
                    is_active: 1
                }
            ],
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    // 34. Admin Site Settings Update: /admin/site-settings
    if (cleanPath === '/admin/site-settings') {
        return {
            data: { message: 'Settings updated successfully', settings: mockSiteSettings },
            status: 200,
            statusText: 'OK',
            config,
            headers: {}
        };
    }

    return null;

}
