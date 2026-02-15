import { createClient } from '@supabase/supabase-js';

// Credentials will be read inside functions to ensure they are available


let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAuthToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const email = process.env.SHIPROCKET_EMAIL;
        const password = process.env.SHIPROCKET_PASSWORD;

        if (!email || !password) {
            throw new Error("Shiprocket credentials missing in .env");
        }

        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shiprocket Auth Failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        cachedToken = data.token;
        // Token is valid for 10 days, but let's cache for 9 days to be safe
        tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
        return cachedToken;
    } catch (error) {
        console.error("Shiprocket Auth Error:", error);
        throw error;
    }
}

export async function checkServiceability(pickupPincode: number, deliveryPincode: number, weight: number = 0.5, cod: boolean = false) {
    const token = await getAuthToken();
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod ? 1 : 0}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    return data;
}

export async function createShiprocketOrder(orderResult: any, user: any, address: any) {
    const token = await getAuthToken();

    // Format date efficiently
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];

    const orderPayload = {
        order_id: orderResult.id,
        order_date: formattedDate,
        pickup_location: "Primary", // You need to set this in Shiprocket Panel
        billing_customer_name: address.name || user.email.split('@')[0],
        billing_last_name: "",
        billing_address: address.address_line1,
        billing_address_2: address.address_line2 || "",
        billing_city: address.city,
        billing_pincode: address.pincode,
        billing_state: address.state,
        billing_country: "India",
        billing_email: user.email,
        billing_phone: address.phone,
        shipping_is_billing: true,
        order_items: [
            {
                name: "Personalised Gift", // Ideally map from order_items
                sku: "gift-sku",
                units: 1,
                selling_price: orderResult.total_amount,
                discount: "",
                tax: "",
                hsn: ""
            }
        ],
        payment_method: "Prepaid",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: orderResult.total_amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
    };

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
    });

    const data = await response.json();
    return data;
}
