document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');

    if (hamburger && nav) {
        // כל העיצוב (מוסתר/פתוח) נמצא ב-CSS. כאן רק מחליפים את המחלקה "open".
        function setMenu(open) {
            hamburger.classList.toggle('open', open);
            nav.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', String(open));
        }

        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            setMenu(!nav.classList.contains('open'));
        });

        // סגירה בלחיצה על קישור
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });

        // מעבר לדסקטופ (מעל 768px) - סוגר את מצב ה"פתוח" של המובייל
        window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
            if (e.matches) setMenu(false);
        });
    } else {
        console.error('❌ לא מצאתי:', {
            hamburger: !!hamburger,
            nav: !!nav
        });
    }


    // ----------------------------------------------------
    // מוצרים
    // ----------------------------------------------------
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilterNav = document.getElementById('category-filter-nav');

    const JSON_PATH = "../data/products.json";
    const defaultImage = "../images/default.png";

    let allProducts = [];

    // מחזיר מספר למיון: 8 -> 8, "8-10" -> 8
    function getNumericPrice(price) {
        if (typeof price === 'number') return price;
        return parseFloat(price) || 0;
    }

    // מחזיר טקסט להצגה: 8 -> "8 ₪", "8-10" -> "8-10 ₪", 0 -> "ללא תשלום"
    function formatPrice(price) {
        if (typeof price === 'string' && price.trim() !== '') {
            return `${price} ₪`;
        }
        return price > 0 ? `${price} ₪` : 'ללא תשלום';
    }

    async function loadProducts() {
        try {
            const response = await fetch(JSON_PATH);

            if (!response.ok) {
                throw new Error(`שגיאת HTTP: ${response.status}`);
            }

            allProducts = await response.json();
            displayProducts(allProducts);

        } catch (error) {
            console.error("שגיאה בטעינת המוצרים:", error);
            productsContainer.innerHTML = '<p style="text-align: center; color: red;">שגיאה בטעינת נתוני המוצרים מהשרת.</p>';
        }
    }

    function displayProducts(productsToDisplay) {
        productsContainer.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productsContainer.innerHTML = '<p style="text-align: center; color: #b03a5b; font-size: 1.2em;">לא נמצאו מוצרים התואמים לחיפוש/סינון.</p>';
            return;
        }

        productsToDisplay.sort((a, b) => {
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return getNumericPrice(b.price) - getNumericPrice(a.price);
        });

        let currentCategory = '';
        productsToDisplay.forEach(product => {
            if (product.category !== currentCategory) {
                currentCategory = product.category;
                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = currentCategory;
                productsContainer.appendChild(categoryHeader);

                const categoryGroup = document.createElement('div');
                categoryGroup.className = 'category-group';
                categoryGroup.id = `group-${currentCategory.replace(/\s/g, '-')}`;
                productsContainer.appendChild(categoryGroup);
            }

            const categoryGroup = productsContainer.lastElementChild;
            const card = document.createElement('div');
            card.className = "product-card";

            const imageUrl = product.image && product.image.trim() !== '' ? product.image : defaultImage;
            const priceText = formatPrice(product.price);

            card.innerHTML = `
                <div class="product-image-wrapper"> 
                    <img src="${imageUrl}" alt="${product.name}">
                </div>
                <h4>${product.name}</h4>
                <p class="product-category-name">קטגוריה: ${product.category}</p>
                <p class="product-price">מחיר: ${priceText}</p> 
            `;
            categoryGroup.appendChild(card);
        });
    }

    function filterProducts() {
        const query = searchInput.value.toLowerCase();
        const activeCategoryButton = document.querySelector('.category-button.active');
        const activeCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'כל המוצרים';

        const filteredBySearch = allProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        let finalFiltered = filteredBySearch;

        if (activeCategory !== 'כל המוצרים') {
            finalFiltered = finalFiltered.filter(product => product.category === activeCategory);
        }

        displayProducts(finalFiltered);
    }

    function handleCategoryClick(event) {
        if (event.target.classList.contains('category-button')) {
            document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const category = event.target.dataset.category;
            searchInput.value = '';

            if (category === 'כל המוצרים') {
                displayProducts(allProducts);
            } else {
                const filtered = allProducts.filter(product => product.category === category);
                displayProducts(filtered);
            }
        }
    }

    loadProducts();
    searchInput.addEventListener('input', filterProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterProducts();
        }
    });
    categoryFilterNav.addEventListener('click', handleCategoryClick);
});