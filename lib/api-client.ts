export const apiClient = {
    checkAccess: async (userId: string) => {
        const res = await fetch('/api/check-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        return res.json();
    },

    verifyAd: async (userId: string, token: string) => {
        const res = await fetch('/api/verify-ad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, token }),
        });
        return res.json();
    }
};
