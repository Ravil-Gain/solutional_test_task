import { Products, UnitProduct } from "./product.interface";
import fs from "fs"

let products: Products = loadProducts() 

function loadProducts () : Products {
  try {
    const data = fs.readFileSync("./products.json", "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.log(`Error ${error}`)
    return {}
  }
}

export const findAll = async (): Promise<UnitProduct[]> => Object.values(products);