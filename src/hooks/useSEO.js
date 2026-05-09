import { useEffect } from 'react';

/**
 * Custom hook to update document title and meta tags dynamically.
 * Works for browser SEO and some modern social crawlers.
 */
const useSEO = ({ title, description, image, price, currency = 'MMK' }) => {
    useEffect(() => {
        // Update Title
        const prevTitle = document.title;
        if (title) {
            document.title = `${title} | Vital Care Pharmacy`;
        }

        // Helper to update or create meta tags
        const updateMeta = (property, content, isProperty = false) => {
            if (!content) return;
            const attr = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attr}="${property}"]`);
            
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update standard meta tags
        if (description) {
            updateMeta('description', description);
        }

        // Update Open Graph tags (Facebook/Viber)
        updateMeta('og:title', title, true);
        updateMeta('og:description', description, true);
        if (image) updateMeta('og:image', image, true);
        updateMeta('og:url', window.location.href, true);
        updateMeta('og:type', 'website', true);

        // Update Twitter tags
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', title);
        updateMeta('twitter:description', description);
        if (image) updateMeta('twitter:image', image);

        // Update Product specific meta (Schema.org / OG Product)
        if (price) {
            updateMeta('product:price:amount', price, true);
            updateMeta('product:price:currency', currency, true);
            updateMeta('og:price:amount', price, true);
            updateMeta('og:price:currency', currency, true);
        }

        return () => {
            document.title = prevTitle;
        };
    }, [title, description, image, price, currency]);
};

export default useSEO;
