import React, { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import "./styles.css"
const CheckoutPage = () => {
    const cart = useSelector((state) => state.cart);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPayPalLoading, setIsPayPalLoading] = useState(true);

    // Debug the cart state
    console.log("Cart state:", cart);

    // Handle undefined or null cart state
    if (!cart) {
        return (
            <div className="empty-cart">
                <h1>Checkout</h1>
                <p>Unable to load cart. Please try again later.</p>
            </div>
        );
    }

    // Handle empty cart
    if (cart.items?.length === 0) {
        return (
            <div className="empty-cart">
                <h1>Checkout</h1>
                <p>Your cart is empty. Please add items before proceeding to checkout.</p>
            </div>
        );
    }

    // Calculate total amount
    const totalAmount = cart.cartTotalAmount.toFixed(2);

    // Handle payment approval
    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: totalAmount,
                        currency_code: "USD",
                    },
                    description: "Purchase from My Store",
                },
            ],
        });
    };

    // Handle payment success
    const onApprove = (data, actions) => {
        setIsProcessing(true);
        return actions.order.capture().then((details) => {
            setOrderCompleted(true);
            setIsProcessing(false);

            // Send payment details to backend
            fetch("/api/process-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paymentId: details.id,
                    cartItems: cart.items,
                    totalAmount: totalAmount,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Backend response:", data);
                })
                .catch((error) => {
                    console.error("Error sending payment details:", error);
                });
        });
    };

    // Handle payment errors
    const onError = (err) => {
        console.error("PayPal error:", err);
        alert("Payment failed. Please try again.");
    };

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            <div className="cart-summery">
                <h2>Order Summary</h2>
                {(cart?.items || []).map((item) => (
                    <div key={item.id} className="cart-items">
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div className="item-details">
                            <h3>{item.name}</h3>
                            <p>${item.price} x {item.cartQuantity}</p>
                        </div>
                    </div>
                ))}
                <div className="total-amount">
                    <h3>Total: ${totalAmount}</h3>
                </div>
            </div>

            {isProcessing && <div className="loading-spinner">Processing payment...</div>}

            {orderCompleted ? (
                <div className="order-success">
                    <h2>Thank you for your purchase!</h2>
                    <p>Your order has been successfully placed.</p>
                </div>
            ) : (
                <div className="paypal-buttons">
                    {isPayPalLoading && <div className="loading-spinner">Loading PayPal buttons...</div>}
                    <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                        onLoad={() => setIsPayPalLoading(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;