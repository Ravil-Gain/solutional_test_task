import cors from "cors"
import helmet from "helmet"
import express from "express"
import * as dotevnv from "dotenv"
import { orderRouter } from "./orders/order.routes"
import { productRouter } from "./products/product.routes"

dotevnv.config()

const PORT = parseInt(process.env.PORT as string, 10) || 7000

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())
app.use(helmet())

// API Routes
app.use('/products', productRouter)
app.use('/orders', orderRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})