// Variables globales
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Cargar el carrito desde localStorage
let currentProductIndex = 0;
let filteredProducts = []; // Para almacenar productos filtrados

// Ocultar el ícono del carrito hasta que se inicie sesión
document.getElementById('cart-icon-container').style.display = 'none';

// Cargar datos de usuario guardados
document.addEventListener('DOMContentLoaded', function() {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
    }
});

// Actualiza el contador del carrito al cargar la página
updateCartCount();

document.getElementById('login-button').addEventListener('click', function() {
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;

    fetch('usuario.json')
        .then(response => response.json())
        .then(user => {
            if (inputUsername === user.username && inputPassword === user.password) {
                // Guardar usuario y contraseña para autocompletar
                localStorage.setItem('savedUsername', inputUsername);
                localStorage.setItem('savedPassword', inputPassword);

                document.getElementById('login-container').style.display = 'none';
                document.getElementById('products-container').style.display = 'block';
                document.getElementById('cart-icon-container').style.display = 'flex'; // Mostrar el ícono del carrito
                loadProducts();
            } else {
                alert('Usuario o clave incorrectos.');
            }
        })
        .catch(error => console.error('Error al cargar el usuario:', error));
});

function loadProducts() {
    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            products = Object.values(data).flat(); // Convertir el objeto en un array de productos
            filteredProducts = products; // Inicialmente, no hay filtros aplicados

            // Poblar el select de categorías
            populateCategoryFilter(data);
            showProducts();
        })
        .catch(error => console.error('Error al cargar productos:', error));
}

function populateCategoryFilter(data) {
    const categorySelect = document.getElementById('category-select');
    
    // Añadir opciones al select de categorías
    Object.keys(data).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Evento para filtrar por categoría
    categorySelect.addEventListener('change', function() {
        filterProducts();
    });
}

function showProducts() {
    const productContainer = document.getElementById('product-cards');
    productContainer.innerHTML = ''; // Limpiar productos anteriores

    const maxProductsToShow = 10;
    const productsToLoad = filteredProducts.slice(currentProductIndex, currentProductIndex + maxProductsToShow);

    productsToLoad.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('col-md-4'); // Bootstrap grid classes
        productCard.innerHTML = `
            <div class="card mb-4 shadow-sm">
                <img src="${product.img}" class="card-img-top" alt="${product.descripcion}">
                <div class="card-body">
                    <h5 class="card-title">${product.descripcion}</h5>
                    <p class="card-text">Precio: $${product.precio}</p>
                    <input type="number" id="quantity-${product.codigo}" min="1" value="1" class="form-control mb-2">
                    <button class="btn btn-success btn-block" onclick="addToCart(${product.codigo})">Agregar al Carrito</button>
                </div>
            </div>
        `;
        productContainer.appendChild(productCard);
    });

    currentProductIndex += maxProductsToShow;
}

document.getElementById('load-more-button').addEventListener('click', showProducts);

function addToCart(productCode) {
    const product = products.find(p => p.codigo === productCode);
    const quantity = parseInt(document.getElementById(`quantity-${productCode}`).value);

    const existingProduct = cart.find(p => p.codigo === productCode);

    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart)); // Guardar el carrito en localStorage
    updateCartCount();

    Swal.fire({
        title: 'Producto agregado',
        text: `Has agregado ${quantity} unidades de ${product.descripcion} al carrito.`,
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

function updateCartCount() {
    const cartCount = cart.reduce((acc, product) => acc + product.quantity, 0);
    document.getElementById('cart-count').innerText = cartCount;
}

document.getElementById('cart-icon').addEventListener('click', function() {
    document.getElementById('products-container').style.display = 'none';
    document.getElementById('cart-container').style.display = 'block';
    showCartDetails();
});

function showCartDetails() {
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';

    cart.forEach(product => {
        const cartItem = document.createElement('li');
        cartItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        cartItem.innerHTML = `
            ${product.descripcion} - $${product.precio} x ${product.quantity} unidades
            <div>
                <input type="number" min="1" value="${product.quantity}" class="form-control d-inline-block w-auto mr-2" onchange="updateProductQuantity(${product.codigo}, this.value)">
                <button class="btn btn-danger" onclick="removeFromCart(${product.codigo})">Eliminar</button>
            </div>
        `;
        cartList.appendChild(cartItem);
    });
}

function updateProductQuantity(productCode, newQuantity) {
    const product = cart.find(p => p.codigo === productCode);
    product.quantity = parseInt(newQuantity);
    localStorage.setItem('cart', JSON.stringify(cart)); // Actualizar el carrito en localStorage
    updateCartCount();
    showCartDetails(); // Refresca la lista del carrito para mostrar la cantidad actualizada
}

function removeFromCart(productCode) {
    cart = cart.filter(p => p.codigo !== productCode);
    localStorage.setItem('cart', JSON.stringify(cart)); // Actualizar el carrito en localStorage
    updateCartCount();
    showCartDetails();
}

document.getElementById('checkout-button').addEventListener('click', function() {
    document.getElementById('cart-container').style.display = 'none';
    document.getElementById('checkout-container').style.display = 'block';
});

document.getElementById('send-order-button').addEventListener('click', function() {
    const clientName = document.getElementById('client-name').value;
    const cartItems = cart.map(item => `${item.descripcion} - $${item.precio} x ${item.quantity} unidades`).join('\n');
    const emailBody = `Tienes un nuevo pedido de ${document.getElementById('username').value}:\n\n${cartItems}\n\nCliente: ${clientName}`;

    Swal.fire({
        title: 'Enviar Pedido',
        text: "¿Cómo deseas enviar tu pedido?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Correo Electrónico',
        cancelButtonText: 'WhatsApp'
    }).then((result) => {
        if (result.isConfirmed) {
            // Enviar por correo electrónico usando Gmail
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=bolitamayorista@gmail.com&su=Tienes un nuevo pedido de ${document.getElementById('username').value}&body=${encodeURIComponent(emailBody)}`;
            window.open(gmailLink, '_blank');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Enviar por WhatsApp
            const whatsappMessage = `https://api.whatsapp.com/send?phone=+5493414682457&text=${encodeURIComponent(emailBody)}`;
            window.open(whatsappMessage, '_blank');
        }

        // Vaciar el carrito después de enviar el pedido
        cart = [];
        localStorage.removeItem('cart'); // Limpiar el carrito de localStorage
        updateCartCount();
        document.getElementById('cart-list').innerHTML = ''; // Limpiar la visualización del carrito
        document.getElementById('checkout-container').style.display = 'none';
        document.getElementById('products-container').style.display = 'block';
    });
});

document.getElementById('search-input').addEventListener('input', function() {
    filterProducts(); // Filtrar productos cada vez que se escribe en el buscador
});

function filterProducts() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const selectedCategory = document.getElementById('category-select').value;

    filteredProducts = products.filter(product => {
        const matchesSearch = product.descripcion.toLowerCase().includes(searchQuery) || product.codigo.toString().includes(searchQuery);
        const matchesCategory = selectedCategory === '' || product.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    currentProductIndex = 0; // Reiniciar índice de productos mostrados
    showProducts(); // Mostrar productos filtrados
}
