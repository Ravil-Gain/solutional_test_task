export interface Product {
  product_id: number;
  name: string;
  price: string;
}

export interface UnitProduct extends Product {
  id: string;
}

export interface Products {
  [key: string]: UnitProduct;
}
