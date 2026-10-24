/* ---------------------------------------------------- */
/* Header ו-Footer משותפים לכל דפי האתר                 */
/* ---------------------------------------------------- */
/*
 * שימוש: בכל דף, מיד אחרי <body data-page="...">, מוסיפים:
 *   <script src="(נתיב יחסי)/scripts/layout.js"></script>
 *
 * הסקריפט רץ באופן סינכרוני ומכניס את ה-Header במקום שבו הוא נטען,
 * כך שכל האלמנטים (search-input, hamburger-menu וכו') קיימים כבר
 * כשסקריפטים אחרים (כמו products.js) מחפשים אותם ב-DOMContentLoaded.
 *
 * ערכי data-page אפשריים: home | about | gallery | contact
 * חיפוש המוצרים מוצג רק בדף הבית (שם נמצאים המוצרים).
 */
(function () {
    const script = document.currentScript;
    // שורש האתר מחושב לפי מיקום הסקריפט (scripts/layout.js) - עובד מכל תיקייה
    const base = new URL('../', script.src).href;
    const currentPage = document.body.dataset.page || '';

    const navLinks = [
        { page: 'home', href: 'index.html', label: 'בית' },
        { page: 'about', href: 'HTML/about.html', label: 'אודות' },
        { page: 'gallery', href: 'HTML/gallery.html', label: 'גלריה' },
        { page: 'contact', href: 'HTML/contact.html', label: 'יצירת קשר' }
    ];

    const navHTML = navLinks.map(link => {
        const isActive = link.page === currentPage;
        return `<a href="${base}${link.href}" data-page="${link.page}"${isActive ? ' class="active" aria-current="page"' : ''}>${link.label}</a>`;
    }).join('');

    const searchHTML = currentPage === 'home' ? `
            <div class="search-bar" role="search">
                <label for="search-input" class="visually-hidden">חיפוש מוצר</label>
                <input type="search" id="search-input" placeholder="חיפוש מוצר..." autocomplete="off">
                <button type="button" id="search-button" aria-label="חיפוש">
                    <svg id="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="16.5" y1="16.5" x2="21" y2="21"></line>
                    </svg>
                </button>
            </div>` : '';

    const headerHTML = `
    <a class="skip-link" href="#main-content">דילוג לתוכן הראשי</a>
    <header class="site-header">
        <div class="header-inner">
            <a href="${base}index.html" class="logo" aria-label="גמ״ח חסדי מאיר - לדף הבית">
                <img id="responsive-logo" src="${base}images/logo.png" alt="" width="56" height="56">
                <span class="brand-text">
                    <span class="brand-name">חסדי מאיר</span>
                    <span class="brand-tagline">גמ״ח ציוד לאירועים</span>
                </span>
            </a>

            <nav id="main-nav" aria-label="ניווט ראשי">${navHTML}</nav>
            ${searchHTML}
            <button id="hamburger-menu" type="button" aria-label="פתיחת תפריט" aria-expanded="false" aria-controls="main-nav">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>`;

    const year = new Date().getFullYear();
    const footerHTML = `
    <footer class="site-footer">
        <div class="footer-inner">
            <div class="footer-col footer-brand">
                <img src="${base}images/logo.png" alt="" width="64" height="64" loading="lazy">
                <div>
                    <p class="footer-title">גמ״ח חסדי מאיר</p>
                    <p>ציוד לאירועים, חינות ובריתות בסכום סמלי.<br>לעילוי נשמת מאיר בן חסיבה ז״ל.</p>
                </div>
            </div>
            <nav class="footer-col" aria-label="ניווט תחתון">
                <p class="footer-title">ניווט</p>
                <ul>
                    ${navLinks.map(link => `<li><a href="${base}${link.href}">${link.label}</a></li>`).join('')}
                </ul>
            </nav>
            <div class="footer-col">
                <p class="footer-title">פרטי התקשרות</p>
                <ul>
                    <li>📍 מצליח מזוז 8, באר שבע</li>
                    <li>☎️ <a href="tel:0556856292">055-685-6292</a></li>
                    <li>✉️ <a href="mailto:Kerenb46@gmail.com">Kerenb46@gmail.com</a></li>
                    <li>איסוף בתיאום מראש בלבד</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${year} כל הזכויות שמורות. <a href="https://www.calanitwebcode.com/" target="_blank" rel="noopener">האתר אופיין, עוצב ונבנה על ידי כלנית מדר</a></p>
        </div>
    </footer>`;

    script.insertAdjacentHTML('beforebegin', headerHTML);

    // ----------------------------------------------------
    // תפריט המבורגר (מובייל)
    // ----------------------------------------------------
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');
    const desktopQuery = window.matchMedia('(min-width: 861px)');

    function setMenu(open) {
        hamburger.classList.toggle('open', open);
        nav.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    }

    hamburger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            setMenu(false);
            hamburger.focus();
        }
    });

    desktopQuery.addEventListener('change', (e) => {
        if (e.matches) setMenu(false);
    });

    // כפתור החיפוש מפעיל את אותו סינון של הקלדה בתיבה (מאזין ה-input ב-products.js)
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            searchInput.focus();
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    // צל עדין ל-Header בזמן גלילה
    const header = document.querySelector('.site-header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ה-Footer נוסף בסוף הדף לאחר טעינת התוכן
    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    });
})();
