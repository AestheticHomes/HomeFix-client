"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/components/CartContext";
import { Trash2, Wrench, Gift, Coins, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  const [installAddon, setInstallAddon] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePromoApply = () => {
    if (promo.trim().toLowerCase() === "home10") setDiscount(0.1);
    else if (promo.trim().toLowerCase() === "fix50") setDiscount(0.5);
    else setDiscount(0);
  };

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => router.push("/checkout"), 600);
  };

  const subtotal = total;
  const installFee = installAddon ? 299 : 0;
  const coinCredit = coins > 0 ? coins : 0;
  const discounted = subtotal * (1 - discount);
  const finalTotal = Math.max(discounted + installFee - coinCredit, 0);

  if (!cart.length)
    return (
     
        <main className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
          <Wrench className="w-8 h-8 mb-3 text-gray-400" />
          <p>Your cart is empty. Add a service to continue.</p>
          <Button className="mt-4" onClick={() => router.push("/services")}>
            Browse Services
          </Button>
        </main>
      
    );

  return (
    
      <main className="max-w-5xl mx-auto p-6 pb-[120px] space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          My Cart
        </h1>

        {/* Cart Items */}
        <div className="space-y-4">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="flex justify-between items-center p-4 border rounded-2xl bg-white dark:bg-slate-800 shadow-sm"
            >
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ₹{item.price}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 border rounded"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 border rounded"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add-on Section */}
        <div className="border rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={installAddon}
              onChange={() => setInstallAddon(!installAddon)}
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Need Professional Installation?{" "}
              <span className="text-green-600">+₹299</span>
            </span>
          </label>
        </div>

        {/* Promo Code */}
        <div className="border rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            <input
              type="text"
              placeholder="Enter promo code"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              className="flex-1 border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
            />
            <Button onClick={handlePromoApply} className="px-4">
              Apply
            </Button>
          </div>
          {discount > 0 && (
            <p className="text-sm text-green-600">
              Promo applied: {discount * 100}% off
            </p>
          )}
        </div>

        {/* Loyalty Coins */}
        <div className="border rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <p className="font-medium">Redeem Coins</p>
          </div>
          <input
            type="number"
            min="0"
            max="500"
            step="10"
            value={coins}
            onChange={(e) => setCoins(Number(e.target.value))}
            className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700"
          />
          <p className="text-xs text-gray-500 mt-1">Max redeemable: ₹500</p>
        </div>

        {/* Total Summary */}
        <motion.div
          layout
          className="border rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm"
        >
          <div className="flex justify-between py-1 text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-1 text-sm text-green-600">
              <span>Discount</span>
              <span>-₹{(subtotal * discount).toFixed(0)}</span>
            </div>
          )}
          {installAddon && (
            <div className="flex justify-between py-1 text-sm">
              <span>Installation Add-on</span>
              <span>₹{installFee}</span>
            </div>
          )}
          {coins > 0 && (
            <div className="flex justify-between py-1 text-sm text-yellow-600">
              <span>Coins Applied</span>
              <span>-₹{coinCredit}</span>
            </div>
          )}
          <div className="flex justify-between mt-3 text-lg font-semibold border-t pt-3">
            <span>Total</span>
            <span className="text-green-600">₹{finalTotal.toFixed(0)}</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/services")}
            className="w-1/2"
          >
            Continue Shopping
          </Button>
          <Button
            className="w-1/2 flex items-center justify-center gap-2"
            disabled={loading}
            onClick={handleCheckout}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Proceed <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </main>
   
  );
}
