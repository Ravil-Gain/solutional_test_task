import { UnitProduct } from "../products/product.interface";

export enum ORDER_STATUS {
  new = "NEW",
  paid = "PAID",
}
export interface OrderProduct extends UnitProduct {
  quantity: number;
  replaced_with: UnitProduct | null;
}

export interface Amount {
  discount: string;
  paid: string;
  returns: string;
  total: string;
}

export interface Order {
  products: OrderProduct[] | [];
  status: ORDER_STATUS;
  amount: Amount;
}

export interface UnitOrder extends Order {
  id: string;
}

export interface Orders {
  [key: string]: UnitOrder;
}
