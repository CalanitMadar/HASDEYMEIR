document.addEventListener('DOMContentLoaded', () => {
    // אלמנטים של ה-DOM
    const form = document.getElementById('addProductForm');
    const tableBody = document.getElementById('productsTableBody');
    const downloadBtn = document.getElementById('downloadJson');
    const submitButton = document.getElementById('submitButton');
    
    // שדות הטופס
    const productId = document.getElementById('productId');
    const productName = document.getElementById('productName');
    const productCategory = document.getElementById('productCategory');
    const productPrice = document.getElementById('productPrice');
    const productImage = document.getElementById('productImage'); // זהו שדה שם הקובץ

    let products = [];
    
    // הגדרות נתיבים קריטיות
    // הנתיב לקובץ ה-JSON (יחסי מתוך admin/)
    const JSON_PATH = '../data/products.json'; 
    // הנתיב הבסיסי לתיקיית התמונות
    const IMAGE_BASE_PATH = '../images/products/'; 

    // ----------------------------------------------------
    // פונקציה 1: טעינת הנתונים מקובץ JSON
    // ----------------------------------------------------
    async function fetchProducts() {
        try {
            // טעינה מקומית עלולה לדרוש שרת (כגון Live Server) כדי למנוע שגיאות CORS
            const response = await fetch(JSON_PATH); 
            
            if (!response.ok) {
                // אם הקובץ לא נמצא, נתחיל עם מערך ריק במקום לשבור את המערכת
                if (response.status === 404) {
                    console.warn(`קובץ JSON לא נמצא בנתיב: ${JSON_PATH}. מתחילים עם רשימת מוצרים ריקה.`);
                    products = [];
                    renderTable();
                    return;
                }
                throw new Error(`שגיאה בטעינת הקובץ: ${response.status}`);
            }
            
            products = await response.json();
            renderTable();
        } catch (error) {
            console.error('שגיאה בטעינת המוצרים:', error);
            alert('שגיאה בטעינת נתוני המוצרים. אנא ודא שהקובץ קיים והרצה משרת מקומי.');
        }
    }

    // ----------------------------------------------------
    // פונקציה 2: הצגת הנתונים בטבלה
    // ----------------------------------------------------
    function renderTable() {
        tableBody.innerHTML = '';
        products.sort((a, b) => a.id - b.id); // ממיין לפי ID
        
        products.forEach(product => {
            const row = tableBody.insertRow();
            
            // חילוץ שם הקובץ בלבד להצגה בטבלה
            let imageName = product.image;
            if (product.image && product.image.includes('/')) {
                imageName = product.image.substring(product.image.lastIndexOf('/') + 1);
            }

            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price}</td>
                <td>${imageName || 'ללא תמונה'}</td>
                <td>
                    <button class="edit-btn" data-id="${product.id}">ערוך</button>
                    <button class="delete-btn" data-id="${product.id}">מחק</button>
                </td>
            `;
        });
    }

    // ----------------------------------------------------
    // פונקציה 3: טיפול בטופס (הוספה ועריכה)
    // ----------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const isEditing = productId.value !== '';
        
        // --- לוגיקה ליצירת נתיב התמונה המלא ---
        const fileName = productImage.value.trim();
        // יצירת הנתיב המלא לשמירה ב-JSON (לדוגמה: ../images/products/file.jpg)
        const fullImagePath = fileName ? IMAGE_BASE_PATH + fileName : ''; 
        // ------------------------------------
        
        const newProductData = {
            name: productName.value,
            category: productCategory.value,
            price: parseFloat(productPrice.value),
            image: fullImagePath, 
        };

        if (isEditing) {
            // עדכון מוצר קיים
            const index = products.findIndex(p => p.id === parseInt(productId.value));
            products[index] = { ...products[index], ...newProductData };
            alert(`המוצר ID: ${productId.value} עודכן בהצלחה!`);
            submitButton.textContent = 'הוסף מוצר'; // החזרת כפתור ברירת המחדל
        } else {
            // הוספת מוצר חדש - יצירת ID חדש
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, ...newProductData });
            alert('המוצר נוסף בהצלחה!');
        }

        form.reset();
        productId.value = ''; // ניקוי ה-ID המוסתר
        renderTable();
    });

    // ----------------------------------------------------
    // פונקציה 4: עריכה ומחיקה (דרך כפתורים בטבלה)
    // ----------------------------------------------------
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = parseInt(target.getAttribute('data-id'));
        
        if (target.classList.contains('delete-btn')) {
            if (confirm(`האם אתה בטוח שברצונך למחוק את מוצר ID: ${id}?`)) {
                products = products.filter(p => p.id !== id);
                renderTable();
                alert('המוצר נמחק בהצלחה! יש להוריד ולעלות את קובץ ה-JSON המעודכן לשרת.');
            }
        } else if (target.classList.contains('edit-btn')) {
            const productToEdit = products.find(p => p.id === id);
            
            // חילוץ שם הקובץ בלבד משדה ה-image המלא ב-JSON 
            let currentImageName = '';
            if (productToEdit.image && productToEdit.image.includes('/')) {
                 // מחלץ את החלק שאחרי הסלאש האחרון (שם הקובץ)
                currentImageName = productToEdit.image.substring(productToEdit.image.lastIndexOf('/') + 1);
            }

            // מילוי הטופס בפרטי המוצר לעריכה
            productId.value = productToEdit.id;
            productName.value = productToEdit.name;
            productCategory.value = productToEdit.category;
            productPrice.value = productToEdit.price;
            productImage.value = currentImageName; // הצגת שם הקובץ בלבד!
            
            submitButton.textContent = `עדכן מוצר ID: ${id}`;
            window.scrollTo(0, 0); // גלילה למעלה לטופס
        }
    });

    // ----------------------------------------------------
    // פונקציה 5: הורדת קובץ ה-JSON המעודכן
    // ----------------------------------------------------
    downloadBtn.addEventListener('click', () => {
        const jsonString = JSON.stringify(products, null, 4); // פורמט עם רווחים לקריאה נוחה
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'products.json'; // השם של הקובץ שיירד
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('קובץ products.json הורד בהצלחה! יש להחליף אותו בקובץ הקיים בתיקיית ה-data ולעלות ל-Git/Vercel.');
    });

    // טעינת המוצרים כשהדף נטען לראשונה
    fetchProducts();
});