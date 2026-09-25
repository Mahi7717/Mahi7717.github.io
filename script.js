// ================================
// PERFUME BY HARAM
// SUPABASE + GOOGLE SHEETS + WHATSAPP
// ================================

const SUPABASE_URL =
    "https://yqhuqriynwcpitjujljb.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_tPLXDubPXbGFCaIVgnKSbw_tNA8APLT";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ================================
// PRODUCTS
// ================================

let cart = [

    {
        name: "Olive Blossom",
        price: 3500,
        quantity: 0
    },

    {
        name: "Green Elegance",
        price: 4000,
        quantity: 0
    },

    {
        name: "Velvet Bloom",
        price: 4500,
        quantity: 0
    }

];


// ================================
// ADD TO CART
// ================================

function addToCart(name, price) {

    let product = cart.find(function(item) {
        return item.name === name;
    });

    if (product) {
        product.quantity++;
    }

    updateCartCount();

    document.getElementById("cartPopup").style.display = "flex";

    displayCart();
}


// ================================
// CART COUNT
// ================================

function updateCartCount() {

    let count = 0;

    cart.forEach(function(product) {
        count += product.quantity;
    });

    let cartCount =
        document.getElementById("cartCount");

    if (cartCount) {
        cartCount.innerText = count;
    }
}


// ================================
// SHOW CART
// ================================

function showCart() {

    document.getElementById("cartPopup").style.display = "flex";

    displayCart();
}


// ================================
// DISPLAY CART
// ================================

function displayCart() {

    let cartItems =
        document.getElementById("cartItems");

    let cartTotal =
        document.getElementById("cartTotal");

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(function(product, index) {

        if (product.quantity > 0) {

            let productTotal =
                product.price * product.quantity;

            total += productTotal;

            cartItems.innerHTML += `

                <div class="cart-item">

                    <h3>${product.name}</h3>

                    <p>
                        Price: Rs. ${product.price}
                    </p>

                    <p>
                        Quantity:

                        <button
                            onclick="decreaseQuantity(${index})">
                            −
                        </button>

                        <strong>
                            ${product.quantity}
                        </strong>

                        <button
                            onclick="increaseQuantity(${index})">
                            +
                        </button>

                    </p>

                    <p>
                        Product Total:
                        Rs. ${productTotal}
                    </p>

                    <button
                        onclick="removeItem(${index})">
                        Remove
                    </button>

                    <hr>

                </div>

            `;
        }

    });

    cartTotal.innerText = "Rs. " + total;
}


// ================================
// INCREASE QUANTITY
// ================================

function increaseQuantity(index) {

    cart[index].quantity++;

    updateCartCount();

    displayCart();
}


// ================================
// DECREASE QUANTITY
// ================================

function decreaseQuantity(index) {

    if (cart[index].quantity > 0) {
        cart[index].quantity--;
    }

    updateCartCount();

    displayCart();
}


// ================================
// REMOVE ITEM
// ================================

function removeItem(index) {

    cart[index].quantity = 0;

    updateCartCount();

    displayCart();
}


// ================================
// CLOSE CART
// ================================

function closeCart() {

    document.getElementById("cartPopup").style.display = "none";
}


// ================================
// PLACE ORDER
// ================================

async function placeOrder(event) {

    event.preventDefault();


    // ============================
    // CUSTOMER DETAILS
    // ============================

    let name =
        document
            .getElementById("customerName")
            .value
            .trim();

    let phone =
        document
            .getElementById("customerPhone")
            .value
            .trim();

    let address =
        document
            .getElementById("customerAddress")
            .value
            .trim();

    let paymentMethod =
        document
            .getElementById("paymentMethod")
            .value;


    // ============================
    // ORDER CALCULATION
    // ============================

    let orderedProducts = [];

    let totalQuantity = 0;

    let total = 0;


    cart.forEach(function(product) {

        if (product.quantity > 0) {

            orderedProducts.push(
                product.name +
                " x " +
                product.quantity
            );

            totalQuantity +=
                product.quantity;

            total +=
                product.price *
                product.quantity;
        }

    });


    // ============================
    // CHECK CART
    // ============================

    if (totalQuantity === 0) {

        alert(
            "Please select at least one perfume."
        );

        return;
    }


    // ============================
    // SAVE ORDER USING SUPABASE RPC
    // ============================

    console.log(
        "Saving order..."
    );


    const { data, error } =
        await supabaseClient.rpc(
            "place_order",
            {

                p_customer_name:
                    name,

                p_phone:
                    phone,

                p_address:
                    address,

                p_product:
                    orderedProducts.join(", "),

                p_quantity:
                    totalQuantity,

                p_total:
                    total,

                p_payment_method:
                    paymentMethod

            }
        );


    // ============================
    // SUPABASE ERROR
    // ============================

    if (error) {

        console.error(
            "SUPABASE ERROR:",
            error
        );

        alert
