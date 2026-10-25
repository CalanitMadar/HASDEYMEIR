// התחברות לפאנל הניהול - שלב 2: GitHub מחזיר לכאן קוד, ממירים אותו לטוקן
// ומעבירים אותו לחלון הפאנל (Decap CMS) דרך postMessage
module.exports = async (req, res) => {
    const { code, state } = req.query;
    const cookies = Object.fromEntries(
        (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(([k]) => k)
    );

    let status = 'error';
    let content = { message: 'ההתחברות נכשלה' };

    try {
        if (!code || !state || state !== cookies.decap_oauth_state) {
            throw new Error('בקשת התחברות לא תקינה, נסו שוב');
        }

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });
        const data = await response.json();
        if (!data.access_token) throw new Error(data.error_description || 'GitHub לא החזיר טוקן');

        status = 'success';
        content = { token: data.access_token, provider: 'github' };
    } catch (error) {
        content = { message: error.message };
    }

    // ההודעה נשלחת רק לחלון מאותו דומיין (הפאנל עצמו)
    const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`).replace(/</g, '\\u003c');

    res.setHeader('Set-Cookie', 'decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(`<!DOCTYPE html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מתחברים...</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 2rem;">
<p>מתחברים לפאנל הניהול...</p>
<script>
(function () {
    var origin = window.location.origin;
    if (!window.opener) { document.body.textContent = 'אפשר לסגור את החלון ולנסות שוב מהפאנל.'; return; }
    function receive(e) {
        if (e.origin !== origin) return;
        window.removeEventListener('message', receive);
        window.opener.postMessage(${message}, origin);
    }
    window.addEventListener('message', receive);
    window.opener.postMessage('authorizing:github', origin);
})();
</script>
</body></html>`);
};
