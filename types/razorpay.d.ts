/**
 * Minimal Razorpay type surface so the server route can compile without the
 * published @types package present. Replace with the real package typings when
 * installing razorpay/@types/razorpay in the project.
 */

declare module "razorpay" {
  export interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status?: string;
    [key: string]: any;
  }

  export interface RazorpayOrderCreateRequest {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, any>;
  }

  export interface RazorpayOrdersApi {
    create(payload: RazorpayOrderCreateRequest): Promise<RazorpayOrder>;
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    orders: RazorpayOrdersApi;
  }

  export default Razorpay;
}
