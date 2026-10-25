// כניסה לפאנל הניהול בקישור אישי (בלי סיסמה ובלי חשבון GitHub)
// הקישור: /nihul-hasdey-meir?k=<ADMIN_LINK_KEY>
// דורש משתני סביבה ב-Vercel:
//   ADMIN_LINK_KEY    - המפתח הסודי שבקישור
//   GITHUB_REPO_TOKEN - Fine-grained token עם הרשאת Contents (קריאה וכתיבה) לריפו הזה בלבד
const crypto = require('crypto');

module.exports = (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    const expected = process.env.ADMIN_LINK_KEY;
    const token = process.env.GITHUB_REPO_TOKEN;
    if (!expected || !token) {
        res.status(500).json({ error: 'הכניסה בקישור לא הוגדרה ב-Vercel' });
        return;
    }

    // השוואה בזמן קבוע, כדי שאי אפשר יהיה לנחש את המפתח לפי זמני תגובה
    const given = Buffer.from(String(req.query.k || ''));
    const secret = Buffer.from(expected);
    if (given.length !== secret.length || !crypto.timingSafeEqual(given, secret)) {
        res.status(403).json({ error: 'קישור לא תקין' });
        return;
    }

    res.status(200).json({ token });
};
