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
// ADMIN LOGIN
// ================================

async function loginAdmin() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");


    if (!email || !password) {

        message.innerText =
            "Email aur password enter karein.";

        return;
    }


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,
            password: password

        });


    if (error) {

        message.innerText =
            "Login failed: " + error.message;

        return;
    }


    document.getElementById("loginBox").style.display =
        "none";

    document.getElementById("dashboard").style.display =
        "block";


    loadOrders();

}


// ================================
// LOAD ORDERS
// ================================

async function loadOrders() {

    const { data, error } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        document.getElementById("ordersTable").innerHTML =
            "<tr><td colspan='10'>" +
            "Orders load nahi huay: " +
            error.message +
            "</td></tr>";

        return;
    }


    const table =
        document.getElementById("ordersTable");

    table.innerHTML = "";


    if (!data || data.length === 0) {

        table.innerHTML =
            "<tr><td colspan='10'>" +
            "Abhi koi orders nahi hain." +
            "</td></tr>";

        return;
    }


    data.forEach(function(order) {


        // DATE FORMAT

        let orderDate = "";

        if (order.created_at) {

            orderDate =
                new Date(
                    order.created_at
                ).toLocaleString();

        }


        table.innerHTML += `

            <tr>

                <td>
                    ${order.id}
                </td>


                <td>
                    ${orderDate}
                </td>


                <td>
                    ${order["Customer Name"] || ""}
                </td>


                <td>
                    ${order["Phone"] || ""}
                </td>


                <td>
                    ${order["Address"] || ""}
                </td>


                <td>
                    ${order["Product"] || ""}
                </td>


                <td>
                    ${order["Quantity"] || ""}
                </td>


                <td>
                    Rs. ${order["Total"] || 0}
                </td>


                <td>

                    <select
                        onchange="
                            updateOrderStatus(
                                ${order.id},
                                this.value
                            )
                        "
                    >

                        <option
                            value="Pending"
                            ${order["Status"] === "Pending"
                                ? "selected"
                                : ""}
                        >
                            Pending
                        </option>


                        <option
                            value="Confirmed"
                            ${order["Status"] === "Confirmed"
                                ? "selected"
                                : ""}
                        >
                            Confirmed
                        </option>


                        <option
                            value="Shipped"
                            ${order["Status"] === "Shipped"
                                ? "selected"
                                : ""}
                        >
                            Shipped
                        </option>


                        <option
                            value="Delivered"
                            ${order["Status"] === "Delivered"
                                ? "selected"
                                : ""}
                        >
                            Delivered
                        </option>


                        <option
                            value="Cancelled"
                            ${order["Status"] === "Cancelled"
                                ? "selected"
                                : ""}
                        >
                            Cancelled
                        </option>

                    </select>

                </td>


                <td>
                    ${order["Payment Method"] || ""}
                </td>

            </tr>

        `;

    });

}


// ================================
// UPDATE ORDER STATUS
// ================================

async function updateOrderStatus(
    orderId,
    newStatus
) {


    const { error } =
        await supabaseClient
            .from("orders")
            .update({

                "Status": newStatus

            })
            .eq(
                "id",
                orderId
            );


    if (error) {

        console.error(
            "STATUS UPDATE ERROR:",
            error
        );


        alert(
            "Status update nahi hua:\n\n" +
            error.message +
            "\n\nCode: " +
            error.code
        );


        return;
    }


    alert(
        "Order status updated successfully!"
    );


    loadOrders();

}


// ================================
// LOGOUT
// ================================

async function logoutAdmin() {


    await supabaseClient.auth.signOut();


    document.getElementById("dashboard").style.display =
        "none";


    document.getElementById("loginBox").style.display =
        "block";

}
