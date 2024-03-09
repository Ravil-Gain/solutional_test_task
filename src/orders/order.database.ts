import fs from "fs";
import { calculateOrderAmounts } from "../util";
import { Product, UnitProduct } from "../products/product.interface";
import * as products_database from "../products/product.database";
import {
  ORDER_STATUS,
  OrderProduct,
  Orders,
  UnitOrder,
} from "./order.interface";

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
  const uuid = require("uuid");

  let id = uuid.v1();
  let check_order = await findOne(id);

  while (check_order) {
    id = uuid.v1();
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
    status: ORDER_STATUS.NEW,
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
  // here should be different validations status
  order.status = newStatus;
  saveOrders();
  return order;
};

export const addProducts = async (
  id: string,
  productsIds: [number]
): Promise<UnitOrder | null | undefined> => {
  const order: UnitOrder = await findOne(id);
  // check if no order

  const orderProducts: OrderProduct[] = order.products;
  productsIds.map(async (prod) => {
    const orderProduct = orderProducts.find((v) => v.product_id === prod);
    if (!orderProduct) {
      const newOrderProduct: Product = await products_database.findOne(prod);
      if (newOrderProduct) {
        orderProducts.push({
          id: "",
          quantity: 1,
          replaced_with: null,
          ...newOrderProduct,
        });
      }
    } else {
      orderProduct.quantity = +1;
    }
  });

  // const newProducts: UnitProduct[] = (await products_database.findAll()).filter(
  //   (p) => productsIds.includes(p.id)
  // );
  // check if no products
  // and add existing products
  // const newSetProducts = [order.products];
  // newProducts.map((p) => {
  //   if (order.products[p.id]) {
  //     // order.products[p.id].
  //   } else {
  //     newSetProducts.push(Object.values(p));
  //   }
  // });
  
  order.products = orderProducts;

  order.amount = calculateOrderAmounts(order.products);
  saveOrders();
  return order;

  //   (p) => productsIds.includes(p.id)
  // );

  // if (!products.length) {
  //   return res
  //     .status(StatusCodes.NOT_FOUND)
  //     .json({ error: `Error resolving ProductIds` });
  // }

  // order.amount = calculateOrderAmounts(products);
  // order.products = products;
};

// extendProducts
