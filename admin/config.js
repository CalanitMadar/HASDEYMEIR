/* ==================================================== */
/* הגדרות פאנל הניהול (Decap CMS)                        */
/* ==================================================== */
/*
 * כל שמירה בפאנל יוצרת commit בריפו ב-GitHub, ו-Vercel מעלה את האתר
 * מחדש אוטומטית (בערך דקה-שתיים עד שהשינוי מופיע באתר).
 *
 * שתי דרכי התחברות:
 * 1. קישור אישי למנהלת (?k=...): api/link-login.js בודק את המפתח ומחזיר
 *    טוקן GitHub מוגבל לריפו הזה, והפאנל נכנס בלי מסך התחברות.
 * 2. התחברות עם חשבון GitHub שיש לו הרשאת כתיבה (api/auth.js, api/callback.js).
 *
 * בהרצה מקומית (localhost) הפאנל עובד מול הקבצים במחשב
 * דרך `npx decap-server`, בלי GitHub.
 */
(async function () {
    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

    // כניסה בקישור האישי: שומרים את הטוקן כמשתמש מחובר לפני שהפאנל עולה.
    // המפתח נשאר בכתובת, כך שהקישור השמור במועדפים תמיד מחדש את הטוקן.
    const linkKey = new URLSearchParams(location.search).get('k');
    if (linkKey && !isLocal) {
        try {
            const response = await fetch('/api/link-login?k=' + encodeURIComponent(linkKey), { cache: 'no-store' });
            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('decap-cms-user', JSON.stringify({ token, backendName: 'github' }));
            } else {
                alert('הקישור לפאנל הניהול לא תקין או שפג תוקפו. פני לכלנית לקבלת קישור חדש.');
            }
        } catch (error) {
            console.error('שגיאה בכניסה עם הקישור:', error);
        }
    }

    const categoryField = {
        name: 'category',
        label: 'קטגוריה',
        widget: 'relation',
        collection: 'categories',
        file: 'all',
        search_fields: ['categories.*.name'],
        value_field: 'categories.*.name',
        display_fields: ['categories.*.name'],
        options_length: 100,
        hint: 'רוצה קטגוריה חדשה? מוסיפים אותה קודם במסך "קטגוריות".'
    };

    CMS.init({
        config: {
            load_config_file: false,
            locale: 'he',
            backend: {
                name: 'github',
                repo: 'CalanitMadar/HASDEYMEIR',
                branch: 'main',
                base_url: location.origin,
                auth_endpoint: 'api/auth',
                commit_messages: {
                    create: 'פאנל ניהול: יצירת {{collection}}',
                    update: 'פאנל ניהול: עדכון {{collection}}',
                    delete: 'פאנל ניהול: מחיקה מ-{{collection}}',
                    uploadMedia: 'פאנל ניהול: העלאת תמונה {{path}}',
                    deleteMedia: 'פאנל ניהול: מחיקת תמונה {{path}}'
                }
            },
            local_backend: isLocal,
            site_url: location.origin,
            display_url: location.origin,
            logo_url: '/images/logo.png',

            // תמונות מוצרים נשמרות בתיקייה הקיימת של האתר
            media_folder: 'images/products',
            public_folder: '/images/products',

            collections: [
                {
                    name: 'products',
                    label: '📦 מוצרים',
                    label_singular: 'מוצר',
                    description: 'כל המוצרים שמוצגים בקטלוג בדף הבית. לחצי על "כל המוצרים" כדי להוסיף, לערוך או למחוק.',
                    editor: { preview: false },
                    files: [
                        {
                            name: 'all',
                            label: 'כל המוצרים',
                            file: 'data/products.json',
                            fields: [
                                {
                                    name: 'products',
                                    label: 'מוצרים',
                                    label_singular: 'מוצר',
                                    widget: 'list',
                                    collapsed: true,
                                    add_to_top: true,
                                    summary: '{{fields.name}}  ·  {{fields.category}}  ·  {{fields.price}} ₪',
                                    hint: 'לחיצה על מוצר פותחת אותו לעריכה. אפשר לגרור מוצרים כדי לשנות סדר.',
                                    fields: [
                                        { name: 'name', label: 'שם המוצר', widget: 'string' },
                                        categoryField,
                                        {
                                            name: 'price',
                                            label: 'מחיר השאלה (₪)',
                                            widget: 'string',
                                            default: '0',
                                            hint: 'מספר בלבד, למשל 15. אפשר גם טווח, למשל 8-10. מחיר 0 יוצג באתר כ"ללא תשלום".',
                                            pattern: ['^\\s*\\d+(\\.\\d+)?(\\s*-\\s*\\d+(\\.\\d+)?)?\\s*$', 'יש לכתוב מספר (למשל 15) או טווח (למשל 8-10)']
                                        },
                                        {
                                            name: 'image',
                                            label: 'תמונה',
                                            widget: 'image',
                                            required: false,
                                            choose_url: false,
                                            hint: 'מומלץ תמונה ריבועית ולא כבדה מדי (עד כ-1MB).'
                                        },
                                        {
                                            name: 'description',
                                            label: 'תיאור קצר (לא חובה)',
                                            widget: 'text',
                                            required: false
                                        },
                                        {
                                            name: 'hidden',
                                            label: 'להסתיר מהאתר',
                                            widget: 'boolean',
                                            default: false,
                                            required: false,
                                            hint: 'למשל כשהפריט לא זמין כרגע. המוצר נשמר כאן ואפשר להחזיר אותו בכל רגע.'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'categories',
                    label: '🏷️ קטגוריות מוצרים',
                    label_singular: 'קטגוריה',
                    description: 'הכפתורים לסינון המוצרים בדף הבית, לפי הסדר שכאן.',
                    editor: { preview: false },
                    files: [
                        {
                            name: 'all',
                            label: 'רשימת הקטגוריות',
                            file: 'data/categories.json',
                            fields: [
                                {
                                    name: 'categories',
                                    label: 'קטגוריות',
                                    label_singular: 'קטגוריה',
                                    widget: 'list',
                                    summary: '{{fields.name}}',
                                    hint: 'גררי כדי לשנות את סדר הכפתורים באתר. לפני מחיקת קטגוריה כדאי להעביר את המוצרים שלה לקטגוריה אחרת.',
                                    fields: [
                                        { name: 'name', label: 'שם הקטגוריה', widget: 'string' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'gallery',
                    label: '🖼️ גלריית אירועים',
                    label_singular: 'תמונה',
                    description: 'התמונות מאירועים שמוצגות בעמוד הגלריה.',
                    editor: { preview: false },
                    files: [
                        {
                            name: 'all',
                            label: 'תמונות הגלריה',
                            file: 'data/gallery.json',
                            fields: [
                                {
                                    name: 'images',
                                    label: 'תמונות',
                                    label_singular: 'תמונה',
                                    widget: 'list',
                                    add_to_top: true,
                                    collapsed: true,
                                    summary: '{{fields.caption}}',
                                    fields: [
                                        {
                                            name: 'image',
                                            label: 'תמונה',
                                            widget: 'image',
                                            choose_url: false,
                                            media_folder: '/images/galleryFromEvent',
                                            public_folder: '/images/galleryFromEvent'
                                        },
                                        { name: 'caption', label: 'כיתוב לתמונה', widget: 'string', required: false }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    });
})();
