// התחברות לפאנל הניהול - שלב 1: הפניה למסך ההתחברות של GitHub
// דורש משתני סביבה ב-Vercel: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (ראו ADMIN_SETUP.md)
const crypto = require('crypto');

module.exports = (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        res.status(500).send('חסר GITHUB_CLIENT_ID בהגדרות Vercel');
        return;
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const state = crypto.randomBytes(16).toString('hex');

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `https://${host}/api/callback`,
        scope: 'repo',
        state
    });

    // ה-state נשמר בעוגייה ונבדק בחזרה, כדי למנוע זיוף בקשות
    res.setHeader('Set-Cookie', `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
    res.end();
};
