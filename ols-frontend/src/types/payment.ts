export interface CashItemPrepare {
    titleName: string;
    merchantUid: string;
    totalAmount: number;
    totalQuantity: number;
}

export interface CashItemVerify {
    impUid: string;
    merchantUid: string;
    courseIds: Array<number>;
}

interface IamportRequest {
  pg: string; 
  channelKey: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email: string;
  buyer_name: string;
}

interface IamportResponse {
  success: boolean;
  error_msg: string;
  imp_uid: string;
  merchant_uid: string;
}

interface Iamport {
    init: (impCode: string) => void;
    request_pay: (param: IamportRequest, callback: (rsp: IamportResponse) => void) => void;
}

declare global {
    interface Window {
        IMP: Iamport;
    }
}

export {};