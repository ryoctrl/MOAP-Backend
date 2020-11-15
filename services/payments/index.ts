import {
  DEFAULT_PAYMENT_SERVICE,
  PAYMENT_SERVICES,
} from '../../libs/constants';

export type Performance = {
  totalPrice: number;
};

export type PaymentResult = {
  error: boolean;
};

export type NemPaymentResult = PaymentResult & {
  buyerAddress: string;
};

export interface IPaymentService {
  getPerformances: () => Promise<Array<Performance>>;
  checkPayment: () => Promise<PaymentResult>;
}

class LocalPaymentService implements IPaymentService {
  async getPerformances() {
    return [];
  }
  async checkPayment() {
    return {
      error: false,
    };
  }
}

let paymentService: IPaymentService;

export const getPaymentService = (): IPaymentService => {
  return paymentService;
};

export const init = () => {
  const ps = process.env.PAYMENT_SERVICE || DEFAULT_PAYMENT_SERVICE;
  paymentService = new LocalPaymentService();
};
