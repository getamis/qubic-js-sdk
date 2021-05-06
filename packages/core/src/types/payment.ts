export const PAYMENT_METHOD_CREDIT_CARD = 'creditCard';
export const PAYMENT_METHOD_WALLET = 'wallet';

export type PaymentMethod = 'creditCard' | 'wallet';

export interface ICurrency {
  symbol: string;
  decimals: number;
}

export type IBilling = {
  method: PaymentMethod;
  currency: string;
};

export interface IProduct {
  description: string;
  price: string;
  currency: string;
}

export interface IPaymentRequest {
  product: IProduct;
  billing: IBilling;
}
