import { Amount } from "./orders/order.interface";
import { Product, Products } from "./products/product.interface";

export function calculateOrderAmounts(products: Product[]): Amount {
  const calculated: Amount = {
    discount: "0.00",
    paid: "0.00",
    returns: "0.00",
    total: "0.00",
  };
  calculated.total = products
    .map((p) => Number(p.price))
    .reduce((partialSum, a) => partialSum + a, 0)
    .toString();

  return calculated;
}
