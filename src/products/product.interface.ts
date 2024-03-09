export interface Product {
  product_id: number;
  name: string;
  price: string;
}

export interface UnitProduct extends Product {
  id: number;
}

export interface Products {
  [key: string]: UnitProduct;
}
