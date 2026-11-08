import type { RestaurantPos } from './contracts.js';

/**
 * Fail-closed Paloma365 adapter. Implement only against API methods confirmed
 * by Paloma365 for this restaurant account (menu read + restaurant order create).
 */
export class Paloma365Adapter implements RestaurantPos {
  async syncMenu(): Promise<{ categories: number; products: number }> {
    if (process.env.PALOMA_ENABLED !== 'true') {
      throw new Error('Paloma365 is not configured. Obtain API access and confirm menu-read permissions.');
    }
    throw new Error('Paloma365 menu sync requires the verified API contract and account permissions.');
  }

  async createPaidOrder(_orderId: string): Promise<{ externalOrderId: string }> {
    if (process.env.PALOMA_ENABLED !== 'true') {
      throw new Error('Paloma365 is not configured. Obtain API access and confirm restaurant order-create permissions.');
    }
    throw new Error('Paloma365 order creation requires the verified API contract and restaurant module mapping.');
  }
}
