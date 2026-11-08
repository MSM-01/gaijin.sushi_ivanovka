export type PaymentCreateInput = {
  orderId: string;
  amountKgs: number;
  description: string;
};
export type PaymentCreateResult = {
  providerPaymentId: string;
  checkoutUrl?: string;
  qrPayload?: string;
};

export interface PaymentProvider {
  createPayment(input: PaymentCreateInput): Promise<PaymentCreateResult>;
  verifyWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): Promise<{
    eventId: string;
    providerPaymentId: string;
    orderId: string;
    amountKgs: number;
    currency: string;
    paid: boolean;
  }>;
}

export interface RestaurantPos {
  syncMenu(): Promise<{ categories: number; products: number }>;
  createPaidOrder(orderId: string): Promise<{ externalOrderId: string }>;
}
