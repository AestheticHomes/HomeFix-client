/**
 * ============================================================
 * 🧾 Edith Mock Razorpay v1.0
 * ------------------------------------------------------------
 * Simulates a real Razorpay checkout promise for local testing.
 * - Returns a fake payment_id and signature after 1.2 s
 * - Randomizes success / failure (90 % success)
 * ============================================================
 */

export interface MockPaymentResponse {
  payment_id: string;
  signature: string;
  status: "success" | "failed";
}

export async function simulateRazorpayPayment(
  amount: number
): Promise<MockPaymentResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90 % success
      resolve({
        payment_id: success ? `PAY_${Date.now().toString(36)}` : "FAILED_TXN",
        signature: success
          ? `SIG_${Math.random().toString(36).slice(2, 10)}`
          : "",
        status: success ? "success" : "failed",
      });
    }, 1200);
  });
}
