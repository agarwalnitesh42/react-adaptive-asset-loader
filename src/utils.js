// src/utils.js
// Detect network speed using navigator.connection (falls back to ping test)
export function getNetworkSpeed() {
    // Closure to maintain private state for ping test
    let speed = 'unknown';
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        // Use effectiveType if available (e.g., 'slow-2g', '4g')
        speed = connection.effectiveType || 'unknown';
    } else {
        // Fallback ping test (simplified, uses a known server ping)
        const startTime = performance.now();
        const img = new Image();
        img.src = 'https://www.google.com/favicon.ico?' + Date.now();
        img.onload = () => {
            const duration = performance.now() - startTime;
            speed = duration < 200 ? 'fast' : duration < 500 ? 'medium' : 'slow';
        };
    }
    return speed; // Returns 'fast', 'medium', 'slow', or 'unknown'
}

// Score asset priority based on visibility and importance
export function calculatePriority(asset, scrollY, windowHeight) {
    const rect = asset.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= windowHeight;
    const distanceFromTop = Math.abs(rect.top);
    const importanceScore = asset.dataset.priority ? parseInt(asset.dataset.priority, 10) : 1; // Custom data attribute
    // Higher score for visible or near-visible assets, weighted by importance
    return (isVisible ? 100 : 100 - distanceFromTop) * importanceScore;
}

// Manage a priority queue for assets
export function prioritizeAssets(assets) {
    const queue = [];
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    assets.forEach(asset => {
        queue.push({ element: asset, priority: calculatePriority(asset, scrollY, windowHeight) });
    });
    return queue.sort((a, b) => b.priority - a.priority); // Sort descending
}

// Load asset with adaptive quality based on network speed
export function loadAsset(asset, networkSpeed) {
    const src = asset.dataset.src; // Store original src in data attribute
    if (!src) return;

    // Sanitize src to prevent XSS (security feature)
    const sanitizedSrc = src.replace(/[<>]/g, '').replace(/javascript:/gi, '');
    const isImage = /\.(jpg|png|gif|webp)$/i.test(sanitizedSrc);

    if (isImage) {
        const img = new Image();
        img.onload = () => asset.src = sanitizedSrc; // Set src only after load
        img.onerror = () => console.error(`Failed to load ${sanitizedSrc}`);
        img.src = networkSpeed === 'slow' ? `${sanitizedSrc}?quality=low` : sanitizedSrc; // Adjust quality via query param
    } else {
        const script = document.createElement('script');
        script.src = sanitizedSrc;
        script.async = true;
        document.head.appendChild(script); // Append safely
    }
}

// CSRF protection for asset loading (simplified token check)
export function checkCSRF() {
    const token = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!token) console.warn('CSRF token missing, consider adding <meta name="csrf-token" content="your-token">');
    return token || 'default-token'; // Fallback for demo
}