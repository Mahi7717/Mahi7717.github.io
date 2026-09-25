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
// INCREASE
// ================================

function increaseQuantity(index) {

    cart[index].quantity++;

    updateCartCount();

    displayCart();
}


// ================================
// DECREASE
// ================================

function decreaseQuantity(index) {

    if (cart[index].quantity > 0) {
        cart[index].quantity--;
    }

    updateCartCount();

    displayCart();
}


// ================================
// REMOVE
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
// GENERATE ORDER ID
// ================================

function generateOrderId() {

    return "ORD-" + Date.now();

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
    // CREATE ORDER ID
    // ============================

    const orderId =
        generateOrderId();


    console.log(
        "ORDER ID:",
        orderId
    );


    // Numeric part for Supabase int8 id
    const numericOrderId =
        Number(
            orderId.replace(
                "ORD-",
                ""
            )
        );


    // ============================
    // SAVE ORDER IN SUPABASE
    // ============================

    const { error } =
        await supabaseClient
            .from("orders")
            .insert([
                {

                    id:
                        numericOrderId,

                    "Customer Name":
                        name,

                    "Phone":
                        phone,

                    "Address":
                        address,

                    "Product":
                        orderedProducts.join(", "),

                    "Quantity":
                        totalQuantity,

                    "Total":
                        total,

                    "Payment Method":
                        paymentMethod,

                    "Status":
                        "Pending"

                }
            ]);


    // ============================
    // SUPABASE ERROR
    // ============================

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
    // GOOGLE SHEETS
    // ============================

    let orderData = {

        orderId:
            orderId,

        name:
            name,

        phone:
            phone,

        address:
            address,

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

            method:
                "POST",

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

        "Order ID: " +
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
    // SUCCESS MESSAGE
    // ============================

    alert(

        "Thank you " +
        name +

        "!\n\n" +

        "Your order has been received." +

        "\n\n" +

        "Your Order ID: " +

        orderId +

        "\n\n" +

        "Please save this Order ID to track your order."

    );


    // ============================
    // CLOSE CART
    // ============================

    document
        .getElementById("cartPopup")
        .style.display = "none";


    // ============================
    // RESET FORM
    // ============================

    document
        .querySelector(".order-box form")
        .reset();


    // ============================
    // RESET CART
    // ============================

    cart.forEach(function(product) {

        product.quantity = 0;

    });


    updateCartCount();

    displayCart();

}


// ================================
// PAYMENT METHOD
// ================================

document
    .getElementById("paymentMethod")
    .addEventListener(
        "change",
        function() {

            let bankDetails =
                document.getElementById(
                    "bankDetails"
                );

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
