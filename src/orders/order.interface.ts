import { UnitProduct } from "../products/product.interface";

export interface OrderProduct extends UnitProduct {
  quantity: number;
  replaced_with: UnitProduct;
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

export interface UnitOrder extends Order{
  id: string;
}

export interface Orders {
  [key : string] : UnitOrder
}

export enum ORDER_STATUS {
  "NEW",
  "PAID"
}