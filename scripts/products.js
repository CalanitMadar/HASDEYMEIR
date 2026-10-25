document.addEventListener('DOMContentLoaded', () => {
    // תפריט ההמבורגר מנוהל ב-scripts/layout.js (Header משותף)

    // ----------------------------------------------------
    // מוצרים
    // ----------------------------------------------------
    // המוצרים והקטגוריות נערכים בפאנל הניהול (admin/) ונשמרים בקבצי ה-JSON
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilterNav = document.getElementById('category-filter-nav');

    const PRODUCTS_PATH = "/data/products.json";
    const CATEGORIES_PATH = "/data/categories.json";
    const defaultImage = "/images/products/default.png";
    const ALL = 'כל המוצרים';

    let allProducts = [];
    let categoryOrder = [];

    // מחזיר מספר למיון: 8 -> 8, "8-10" -> 8
    function getNumericPrice(price) {
        if (typeof price === 'number') return price;
        return parseFloat(price) || 0;
    }

    // מחזיר טקסט להצגה: 8 -> "8 ₪", "8-10" -> "8-10 ₪", 0 / ריק -> "ללא תשלום"
    function formatPrice(price) {
        const text = String(price ?? '').trim();
        if (text === '' || Number(text) === 0) return 'ללא תשלום';
        return `${text} ₪`;
    }

    // מונע הזרקת HTML מתוך הנתונים
    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[ch]);
    }

    async function fetchJSON(path) {
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`שגיאת HTTP: ${response.status}`);
        return response.json();
    }

    async function loadProducts() {
        try {
            const [productsData, categoriesData] = await Promise.all([
                fetchJSON(PRODUCTS_PATH),
                fetchJSON(CATEGORIES_PATH).catch(() => ({ categories: [] }))
            ]);

            // תמיכה גם בפורמט הישן (מערך) וגם בחדש ({ products: [...] })
            const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
            allProducts = products.filter(p => p && p.name && !p.hidden);

            categoryOrder = (categoriesData.categories || []).map(c => c.name).filter(Boolean);
            // קטגוריה שקיימת במוצר אך נמחקה מהרשימה - תוצג בסוף
            allProducts.forEach(p => {
                if (p.category && !categoryOrder.includes(p.category)) categoryOrder.push(p.category);
            });

            renderCategoryButtons();
            displayProducts(allProducts);

        } catch (error) {
            console.error("שגיאה בטעינת המוצרים:", error);
            productsContainer.innerHTML = '<p style="text-align: center; color: red;">שגיאה בטעינת נתוני המוצרים מהשרת.</p>';
        }
    }

    // כפתורי הסינון נבנים לפי סדר הקטגוריות בפאנל, רק לקטגוריות שיש בהן מוצרים
    function renderCategoryButtons() {
        const used = new Set(allProducts.map(p => p.category));
        categoryFilterNav.querySelectorAll('.category-button:not([data-category="' + ALL + '"])').forEach(btn => btn.remove());
        categoryOrder.filter(name => used.has(name)).forEach(name => {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.dataset.category = name;
            button.textContent = name;
            categoryFilterNav.appendChild(button);
        });
    }

    function displayProducts(productsToDisplay) {
        productsContainer.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productsContainer.innerHTML = '<p style="text-align: center; color: #b03a5b; font-size: 1.2em;">לא נמצאו מוצרים התואמים לחיפוש/סינון.</p>';
            return;
        }

        const rank = name => {
            const index = categoryOrder.indexOf(name);
            return index === -1 ? categoryOrder.length : index;
        };
        const sorted = [...productsToDisplay].sort((a, b) =>
            rank(a.category) - rank(b.category) || getNumericPrice(b.price) - getNumericPrice(a.price)
        );

        let currentCategory = null;
        let categoryGroup = null;
        sorted.forEach(product => {
            if (product.category !== currentCategory) {
                currentCategory = product.category;
                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = currentCategory || 'כללי';
                productsContainer.appendChild(categoryHeader);

                categoryGroup = document.createElement('div');
                categoryGroup.className = 'category-group';
                categoryGroup.id = `group-${String(currentCategory).replace(/\s/g, '-')}`;
                productsContainer.appendChild(categoryGroup);
            }

            const card = document.createElement('div');
            card.className = "product-card";

            const imageUrl = product.image && product.image.trim() !== '' ? product.image : defaultImage;
            const description = product.description
                ? `<p class="product-description">${escapeHTML(product.description)}</p>`
                : '';

            card.innerHTML = `
                <div class="product-image-wrapper">
                    <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.onerror=null; this.src='${defaultImage}'">
                </div>
                <div class="product-body">
                    <p class="product-category-name">${escapeHTML(product.category)}</p>
                    <h4>${escapeHTML(product.name)}</h4>
                    ${description}
                    <p class="product-price"><span class="price-label">מחיר השאלה</span> <strong>${escapeHTML(formatPrice(product.price))}</strong></p>
                    <a class="btn btn-primary product-cta" href="HTML/contact.html">לתיאום השאלה</a>
                </div>
            `;
            categoryGroup.appendChild(card);
        });
    }

    function getActiveCategory() {
        const activeCategoryButton = categoryFilterNav.querySelector('.category-button.active');
        return activeCategoryButton ? activeCategoryButton.dataset.category : ALL;
    }

    function filterProducts() {
        const query = searchInput.value.trim().toLowerCase();
        const activeCategory = getActiveCategory();

        const filtered = allProducts.filter(product =>
            (activeCategory === ALL || product.category === activeCategory) &&
            (product.name.toLowerCase().includes(query) ||
             String(product.category || '').toLowerCase().includes(query) ||
             String(product.description || '').toLowerCase().includes(query))
        );

        displayProducts(filtered);
    }

    function handleCategoryClick(event) {
        const button = event.target.closest('.category-button');
        if (!button) return;
        categoryFilterNav.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        if (searchInput) searchInput.value = '';
        filterProducts();
    }

    loadProducts();
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterProducts();
            }
        });
    }
    categoryFilterNav.addEventListener('click', handleCategoryClick);
});
