import type { PaymentProvider, PaymentCreateInput, PaymentCreateResult } from './contracts.js';

/**
 * Deliberately fail closed until GoPay provides the merchant API contract,
 * credentials, webhook authentication rules and sandbox access.
 * Do not invent endpoint paths or signatures.
 */
export class GoPayProvider implements PaymentProvider {
  async createPayment(_input: PaymentCreateInput): Promise<PaymentCreateResult> {
    if (process.env.GOPAY_ENABLED !== 'true') {
      throw new Error('GoPay is not configured. Obtain official merchant API credentials and sandbox access.');
    }
    throw new Error('GoPay adapter requires the verified merchant API specification before implementation.');
  }

  async verifyWebhook(_rawBody: Buffer, _headers: Record<string, string | string[] | undefined>): Promise<never> {
    throw new Error('GoPay webhook verification is not implemented until its official signature specification is supplied.');
  }
}
