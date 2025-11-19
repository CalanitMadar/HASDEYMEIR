document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // לוגיקת תפריט המבורגר (נדרש גם בגלריה אם משתמשים באותו header)
    // ----------------------------------------------------
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            // הוספת/הסרת הקלאס 'open' הן מהכפתור והן מהתפריט
            hamburger.classList.toggle('open');
            nav.classList.toggle('open');
        });
    }

    // ----------------------------------------------------
    // טעינת וסינון מוצרים
    // ----------------------------------------------------
    // הקונטיינר של כרטיסי המוצר בדף הגלריה
    const productsContainer = document.getElementById('gallery-products-container'); 
    
    // קלט החיפוש (נשאר זהה, אם יש סרגל חיפוש בגלריה)
    const searchInput = document.getElementById('search-input'); 
    
    // הנתיבים מותאמים לשימוש בתוך קובץ JS שנמצא בתיקייה scripts
    const JSON_PATH = "../data/products.json";
    const defaultImage = "../images/default.png"; 

    let allProducts = []; // מאחסן את המוצרים שנטענו

    // אם הקונטיינר לא קיים (כמו בדף ה"בבנייה" הזמני), מפסיקים.
    if (!productsContainer) {
        console.log("קונטיינר המוצרים לא נמצא בדף הגלריה. לא נטען מידע.");
        return;
    }

    // ----------------------------------------------------
    // פונקציה לטעינת המוצרים מקובץ JSON החיצוני
    // ----------------------------------------------------
    async function loadProducts() {
        try {
            const response = await fetch(JSON_PATH); 
            
            if (!response.ok) {
                throw new Error(`שגיאת HTTP: ${response.status}`);
            }
            
            allProducts = await response.json();
            
            // הצגה ראשונית של כל המוצרים
            displayProducts(allProducts);

        } catch (error) {
            console.error("שגיאה בטעינת המוצרים:", error);
            productsContainer.innerHTML = '<p style="text-align: center; color: red;">שגיאה בטעינת נתוני המוצרים.</p>';
        }
    }


    // ----------------------------------------------------
    // פונקציה שמציגה מוצרים בדף
    // *משתמשת בקלאס `gallery-item` שהגדרנו עבור דף הגלריה*
    // ----------------------------------------------------
    function displayProducts(productsToDisplay) {
        productsContainer.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productsContainer.innerHTML = '<p style="text-align: center; color: #b03a5b; font-size: 1.2em;">לא נמצאו מוצרים התואמים לחיפוש.</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            const card = document.createElement('div');
            // *** שינוי קלאס הכרטיס ל-gallery-item כפי שסוכם בדף הגלריה ***
            card.className = "gallery-item"; 

            // הנתיב שנטען מתוך ה-JSON, אם ריק נשתמש בתמונת ברירת המחדל
            const imageUrl = product.image && product.image.trim() !== '' ? product.image : defaultImage;

            // קטע יצירת הכרטיס, מותאם לעיצוב הגלריה
            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='${defaultImage}'">
                <div class="item-info">
                    <h3>${product.name}</h3>
                    <p>קטגוריה: ${product.category}</p>
                    <p class="product-price">מחיר: ${product.price} ₪</p> 
                </div>
            `;
            productsContainer.appendChild(card);
        });
    }

    // ----------------------------------------------------
    // פונקציה שמסננת את המוצרים לפי קלט החיפוש
    // ----------------------------------------------------
    if (searchInput) {
        function filterProducts() {
            const query = searchInput.value.toLowerCase();
            const filtered = allProducts.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
            displayProducts(filtered);
        }

        // ----------------------------------------------------
        // הרצה ראשונית ואירועים
        // ----------------------------------------------------
        searchInput.addEventListener('input', filterProducts);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterProducts();
            }
        });
    }
    
    // הרצת טעינת המוצרים
    loadProducts();
});