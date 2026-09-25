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

    if (!cartItems || !cartTotal) {
        return;
    }

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
                            type="button"
                            onclick="decreaseQuantity(${index})">
                            −
                        </button>

                        <strong>
                            ${product.quantity}
                        </strong>

                        <button
                            type="button"
                            onclick="increaseQuantity(${index})">
                            +
                        </button>

                    </p>

                    <p>
                        Product Total:
                        Rs. ${productTotal}
                    </p>

                    <button
                        type="button"
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


    if (totalQuantity === 0) {

        alert(
            "Please select at least one perfume."
        );

        return;
    }


    // ============================
    // SAVE TO SUPABASE
    // ============================

    console.log("Saving order...");


    const { data, error } =
        await supabaseClient.rpc(
            "place_order",
            {
                p_customer_name: name,
                p_phone: phone,
                p_address: address,
                p_product: orderedProducts.join(", "),
                p_quantity: totalQuantity,
                p_total: total,
                p_payment_method: paymentMethod
            }
        );


    if (error) {

        console.error(
            "SUPABASE ERROR:",
            error
        );

        alert(
            "ORDER SAVE ERROR:\n\n" +
            error.message +
            "\n\nCode: " +
            error.code
        );

        return;
    }


    // ============================
    // ORDER ID
    // ============================

    const orderId =
        "ORD-" + data;


    console.log(
        "Order successfully created:",
        orderId
    );


    // ============================
    // GOOGLE SHEETS
    // ============================

    let orderData = {

        orderId: orderId,

        name: name,

        phone: phone,

        address: address,

        products:
            orderedProducts.join(", "),

        quantity:
            totalQuantity,

        total:
            total,

        paymentMethod:
            paymentMethod
    };


    fetch(
        "https://script.google.com/macros/s/AKfycbwKbuwT4wUWa8TGUWAjBECtATr0G74_f4lGlRwFDIt4M8VE43CWYt1jgNM9uF5kHvLn-Q/exec",
        {
            method: "POST",

            body:
                new URLSearchParams(
                    orderData
                )
        }
    )
    .then(function(response) {

        console.log(
            "Google Sheets response:",
            response
        );

    })
    .catch(function(error) {

        console.error(
            "Google Sheets Error:",
            error
        );

    });


    // ============================
    // WHATSAPP
    // ============================

    let whatsappNumber =
        "923112556930";


    let whatsappMessage =

        "🛍️ New Order - Perfume by Haram\n\n" +

        "Order Tracking ID: " +
        orderId +
        "\n\n" +

        "Customer: " +
        name +
        "\n" +

        "Phone: " +
        phone +
        "\n" +

        "Address: " +
        address +
        "\n\n" +

        "Products: " +
        orderedProducts.join(", ") +
        "\n" +

        "Total Quantity: " +
        totalQuantity +
        "\n" +

        "Total Bill: Rs. " +
        total +
        "\n\n" +

        "Payment: " +
        paymentMethod +
        "\n\n" +

        "Status: Pending";


    let whatsappURL =

        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(
            whatsappMessage
        );


    window.open(
        whatsappURL,
        "_blank"
    );


    // ============================
    // SUCCESS
    // ============================

    alert(

        "Thank you " +
        name +
        "!\n\n" +

        "Your order has been received." +
        "\n\n" +

        "Your Order Tracking ID:\n" +

        orderId +

        "\n\n" +

        "Please save this ID to track your order."

    );


    closeCart();


    // RESET FORM

    let orderForm =
        document.querySelector(
            ".order-box form"
        );

    if (orderForm) {
        orderForm.reset();
    }


    // RESET CART

    cart.forEach(function(product) {
        product.quantity = 0;
    });


    updateCartCount();

    displayCart();
}


// ================================
// PAYMENT METHOD
// ================================

let paymentMethodElement =
    document.getElementById(
        "paymentMethod"
    );

if (paymentMethodElement) {

    paymentMethodElement.addEventListener(
        "change",
        function() {

            let bankDetails =
                document.getElementById(
                    "bankDetails"
                );

            if (!bankDetails) {
                return;
            }

            if (
                this.value ===
                "Bank Transfer"
            ) {

                bankDetails.style.display =
                    "block";

            } else {

                bankDetails.style.display =
                    "none";
            }

        }
    );
}


// ================================
// 3D PERFUME CARD EFFECT
// ================================

document
    .querySelectorAll(".perfume-card")
    .forEach(function(card) {

        card.addEventListener(
            "mousemove",
            function(e) {

                const rect =
                    card.getBoundingClientRect();

                const x =
                    e.clientX -
                    rect.left;

                const y =
                    e.clientY -
                    rect.top;

                const centerX =
                    rect.width / 2;

                const centerY =
                    rect.height / 2;

                const rotateY =
                    ((x - centerX) /
                    centerX) * 8;

                const rotateX =
                    ((centerY - y) /
                    centerY) * 8;

                card.style.transform = `

                    perspective(1200px)

                    rotateX(${rotateX}deg)

                    rotateY(${rotateY}deg)

                    translateY(-15px)

                    scale(1.02)

                `;
            }
        );


        card.addEventListener(
            "mouseleave",
            function() {

                card.style.transform = "";

            }
        );

    });
