document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    
    // הנתיב לקובץ ה-JSON (יחסי מתוך שורש האתר או התיקיה של קובץ ה-JS, נשתמש בנתיב יחסי לשורש האתר כמו שסוכם עבור Vercel)
    const JSON_PATH = "../data/products.json";
    const defaultImage = "../images/default.png"; // נתיב יחסי לקובץ ה-JS, או נתיב מוחלט לשורש האתר

    let allProducts = []; // מאחסן את המוצרים שנטענו

    // ----------------------------------------------------
    // פונקציה לטעינת המוצרים מקובץ JSON החיצוני
    // ----------------------------------------------------
    async function loadProducts() {
        try {
            // שימוש ב-fetch לקריאת ה-JSON המעודכן
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
    // ----------------------------------------------------
    function displayProducts(productsToDisplay) {
        productsContainer.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productsContainer.innerHTML = '<p style="text-align: center; color: #b03a5b; font-size: 1.2em;">לא נמצאו מוצרים התואמים לחיפוש.</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            const card = document.createElement('div');
            card.className = "product-card";

            // הנתיב שנטען מתוך ה-JSON, אם ריק נשתמש בתמונת ברירת המחדל
            const imageUrl = product.image && product.image.trim() !== '' ? product.image : defaultImage;

           // קטע יצירת הכרטיס ב-products.js
        card.innerHTML = `
            <div class="product-image-wrapper"> 
                <img src="${imageUrl}" alt="${product.name}">
            </div>
            <h3>${product.name}</h3>
            <p>קטגוריה: ${product.category}</p>
            
            <p class="product-price">מחיר: ${product.price} ₪</p> 
            
            `;
            productsContainer.appendChild(card);
        });
                
    }

    // ----------------------------------------------------
    // פונקציה שמסננת את המוצרים לפי קלט החיפוש
    // ----------------------------------------------------
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
    loadProducts();

    searchInput.addEventListener('input', filterProducts);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterProducts();
        }
    });
});