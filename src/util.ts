import { Amount, ORDER_STATUS, OrderProduct } from "./orders/order.interface";

export function calculateOrderAmounts(
  calculated: Amount,
  products: OrderProduct[]
): Amount {
  calculated.total = products
    .map((p) => Number(p.price) * p.quantity)
    .reduce((partialSum, a) => partialSum + a, 0)
    .toString();

  return calculated;
}

export function calculatePaidOrderAmounts(
  calculated: Amount,
  products: OrderProduct
): Amount {
  calculated.discount = (
    Number(calculated.paid) -
    Number(products.price) * products.quantity
  )
    .toFixed(2)
    .toString();
  return calculated;
}

const transitionMap: { [key in ORDER_STATUS]: ORDER_STATUS[] } = {
  [ORDER_STATUS.new]: [ORDER_STATUS.paid],
  [ORDER_STATUS.paid]: [],
};

export function statusTransition(
  currentStatus: ORDER_STATUS,
  nextStatus: ORDER_STATUS
): boolean {
  return transitionMap[currentStatus].includes(nextStatus);
}
