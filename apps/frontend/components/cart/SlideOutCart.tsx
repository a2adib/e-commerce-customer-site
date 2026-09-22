"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

export function SlideOutCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === overlayRef.current) closeCart(); }}
        />
      )}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Cart ({items.length})</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">Your cart is empty</div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.product_id} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border text-sm"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.product_id)} className="text-xs text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>${totalPrice().toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                const successUrl = `${window.location.origin}/checkout/success`;
                const cancelUrl = `${window.location.origin}/cart`;
                window.location.href = `/checkout?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
              }}
              className="btn-primary mt-4 w-full"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
