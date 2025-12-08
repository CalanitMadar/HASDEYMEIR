document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilterNav = document.getElementById('category-filter-nav');

    // נתיב לקובץ ה-JSON (כפי שהוגדר קודם)
    const JSON_PATH = "../data/products.json";
    const defaultImage = "../images/default.png"; 

    let allProducts = []; // מאחסן את המוצרים שנטענו

    // ----------------------------------------------------
    // פונקציות תפריט המבורגר
    // ----------------------------------------------------
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            nav.classList.toggle('open');
        });
    }

    // ----------------------------------------------------
    // פונקציה לטעינת המוצרים מקובץ JSON
    // ----------------------------------------------------
    async function loadProducts() {
        try {
            // שימוש ב-fetch לקריאת ה-JSON המעודכן
            // אם המוצרים לא נטענים דרך נתיב, נשתמש בנתונים הקשיחים החדשים
            // נניח שהנתונים ב-products.json מעודכנים כפי שסופק בסעיף 1
            const response = await fetch(JSON_PATH); 
            
            if (!response.ok) {
                // אם יש בעיה בטעינה החיצונית, ננסה להשתמש בנתונים קשיחים למקרה חירום (או נציג שגיאה)
                throw new Error(`שגיאת HTTP: ${response.status}`);
            }
            
            allProducts = await response.json();
            
            // הצגה ראשונית של כל המוצרים
            displayProducts(allProducts);

        } catch (error) {
            console.error("שגיאה בטעינת המוצרים, משתמש בנתונים המקוריים שסופקו:", error);
            // אם יש שגיאה בטעינת ה-JSON, נוכל להשתמש במערך שהמשתמש סיפק, אבל נניח שהוא מעודכן.
             productsContainer.innerHTML = '<p style="text-align: center; color: red;">שגיאה בטעינת נתוני המוצרים מהשרת. מוצגת רשימה חלקית.</p>';
        }
    }


    // ----------------------------------------------------
    // פונקציה שמציגה מוצרים בדף
    // ----------------------------------------------------
    function displayProducts(productsToDisplay) {
        productsContainer.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productsContainer.innerHTML = '<p style="text-align: center; color: #b03a5b; font-size: 1.2em;">לא נמצאו מוצרים התואמים לחיפוש/סינון.</p>';
            return;
        }

        // מיון המוצרים: לפי קטגוריה ובה כל קטגוריה לפי מחיר (יורד)
        productsToDisplay.sort((a, b) => {
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return b.price - a.price; // מחיר יורד בתוך הקטגוריה
        });
        
        let currentCategory = '';
        productsToDisplay.forEach(product => {
            // אם הקטגוריה השתנתה, צור כותרת חדשה לקטגוריה
            if (product.category !== currentCategory) {
                currentCategory = product.category;
                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = currentCategory;
                productsContainer.appendChild(categoryHeader);

                // הוספת מיכל עבור המוצרים בתוך הקטגוריה
                const categoryGroup = document.createElement('div');
                categoryGroup.className = 'category-group';
                categoryGroup.id = `group-${currentCategory.replace(/\s/g, '-')}`;
                productsContainer.appendChild(categoryGroup);
            }
            
            const categoryGroup = productsContainer.lastElementChild;

            const card = document.createElement('div');
            card.className = "product-card";

            // הנתיב שנטען מתוך ה-JSON, אם ריק נשתמש בתמונת ברירת המחדל
            const imageUrl = product.image && product.image.trim() !== '' ? product.image : defaultImage;
            const priceText = product.price > 0 ? `${product.price} ₪` : 'ללא תשלום';


            // קטע יצירת הכרטיס
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

    // ----------------------------------------------------
    // פונקציה שמסננת את המוצרים לפי קלט החיפוש
    // ----------------------------------------------------
    function filterProducts() {
        const query = searchInput.value.toLowerCase();
        
        // נבדוק איזה כפתור קטגוריה פעיל כרגע
        const activeCategoryButton = document.querySelector('.category-button.active');
        const activeCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'כל המוצרים';

        const filteredBySearch = allProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        let finalFiltered = filteredBySearch;

        // אם לא מסננים לפי 'כל המוצרים', נסנן גם לפי הקטגוריה הפעילה
        if (activeCategory !== 'כל המוצרים') {
            finalFiltered = finalFiltered.filter(product => product.category === activeCategory);
        }

        displayProducts(finalFiltered);
    }

    // ----------------------------------------------------
    // פונקציה לטיפול בלחיצות על כפתורי הקטגוריה
    // ----------------------------------------------------
    function handleCategoryClick(event) {
        if (event.target.classList.contains('category-button')) {
            // הסרת הקלאס 'active' מכל הכפתורים
            document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
            
            // הוספת הקלאס 'active' לכפתור שנלחץ
            event.target.classList.add('active');
            
            const category = event.target.dataset.category;
            
            // איפוס שדה החיפוש
            searchInput.value = '';
            
            if (category === 'כל המוצרים') {
                displayProducts(allProducts);
            } else {
                const filtered = allProducts.filter(product => product.category === category);
                displayProducts(filtered);
            }
        }
    }


    // ----------------------------------------------------
    // הרצה ראשונית ואירועים
    // ----------------------------------------------------
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