import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

let echo;
if (isVercel || !import.meta.env.VITE_REVERB_APP_KEY) {
    const dummyChannel = {
        listen: () => dummyChannel,
        stopListening: () => dummyChannel
    };
    echo = {
        channel: () => dummyChannel,
        private: () => dummyChannel,
        leave: () => {},
        connector: { pusher: { config: { auth: {} } } }
    };
} else {
    echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}

export default echo;
