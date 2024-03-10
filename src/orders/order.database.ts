import fs from "fs";
import { calculateOrderAmounts, calculatePaidOrderAmounts } from "../util";
import { UnitProduct } from "../products/product.interface";
import * as products_database from "../products/product.database";
import {
  ORDER_STATUS,
  OrderProduct,
  Orders,
  UnitOrder,
} from "./order.interface";

const uuid = require("uuid");
const path = "./data/orders.json";
let orders: Orders = loadOrders();

function loadOrders(): Orders {
  try {
    const data = fs.readFileSync(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(`Error ${error}`);
    return {};
  }
}

function saveOrders() {
  try {
    fs.writeFileSync(path, JSON.stringify(orders), "utf-8");
    console.log(`Order saved successfully!`);
  } catch (error) {
    console.log(`Error : ${error}`);
  }
}

export const findAll = async (): Promise<UnitOrder[]> => Object.values(orders);

export const findOne = async (id: string): Promise<UnitOrder> => orders[id];

export const create = async (): Promise<UnitOrder | null> => {
  // Check for unique ID
  let id = uuid.v4();
  let check_order = await findOne(id);

  while (check_order) {
    id = uuid.v4();
    check_order = await findOne(id);
  }

  const order: UnitOrder = {
    id,
    products: [],
    amount: {
      discount: "0.00",
      paid: "0.00",
      returns: "0.00",
      total: "0.00",
    },
    status: ORDER_STATUS.new,
  };

  // add created order to orders and save it
  orders[id] = order;
  saveOrders();
  return order;
};

export const changeStatus = async (
  id: string,
  newStatus: ORDER_STATUS
): Promise<UnitOrder | null> => {
  const order = await findOne(id);
  if (newStatus === "PAID") order.amount.paid = order.amount.total;

  order.status = newStatus;
  saveOrders();
  return order;
};

export const addProducts = async (
  id: string,
  productsIds: [number]
): Promise<UnitOrder | null | undefined> => {
  const order: UnitOrder = await findOne(id);
  const orderProducts: OrderProduct[] = [];
  // iterate through products and add it or increase quantity
  await productsIds.map(async (prod) => {
    const orderProduct = orderProducts.find((v) => v.product_id === prod);
    if (!orderProduct) {
      const orderNewProduct: UnitProduct = await products_database.findOne(
        prod
      );
      if (orderNewProduct) {
        orderProducts.push({
          name: orderNewProduct.name,
          price: orderNewProduct.price,
          id: uuid.v4(),
          product_id: Number(orderNewProduct.id),
          quantity: 1,
          replaced_with: null,
        } as OrderProduct);
      }
    } else {
      orderProduct.quantity = +1;
    }
  });

  order.amount = calculateOrderAmounts(order.amount, orderProducts);
  order.products = orderProducts;
  orders[order.id] = order;

  saveOrders();
  return order;
};

export const changeQuantity = async (
  orderId: string,
  order_product_id: string,
  newQuantity: number
): Promise<boolean> => {
  const order = await findOne(orderId);
  order.products.filter((p) => p.id === order_product_id)[0].quantity =
    newQuantity;
  order.amount = calculateOrderAmounts(order.amount, order.products);

  orders[order.id] = order;
  saveOrders();
  return false;
};

export const replaceProduct = async (
  orderId: string,
  productId: string,
  replaceProductId: number,
  replacequantity: number
): Promise<boolean> => {
  const order = await findOne(orderId);
  order.products.find((p) => p.id === productId);

  const replaceProduct: UnitProduct = await products_database.findOne(
    replaceProductId
  );
  const replaceProductObject = {
    name: replaceProduct.name,
    price: replaceProduct.price,
    id: uuid.v4(),
    product_id: Number(replaceProduct.id),
    quantity: replacequantity,
    replaced_with: null,
  } as OrderProduct;

  order.products.filter((p) => p.id === productId)[0].replaced_with =
    replaceProductObject;

  order.amount = calculatePaidOrderAmounts(order.amount, replaceProductObject);
  orders[order.id] = order;

  saveOrders();
  return false;
};
