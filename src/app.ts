import cors from "cors"
import helmet from "helmet"
import express from "express"
import * as dotevnv from "dotenv"
import { orderRouter } from "./orders/order.routes"
import { productRouter } from "./products/product.routes"

dotevnv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())
app.use(helmet())

// API Routes
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)

export default app;