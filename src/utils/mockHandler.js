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

    return null;
}
