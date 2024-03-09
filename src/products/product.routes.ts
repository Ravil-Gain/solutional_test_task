import express, {Request, Response} from "express"
import {StatusCodes} from "http-status-codes"
import * as database from "./product.database"
import { UnitProduct } from "./product.interface"

export const productRouter = express.Router()

productRouter.get("/", async (req : Request, res : Response) => {
    try {
        const allProducts : UnitProduct[] = await database.findAll()

        if (!allProducts) {
            return res.status(StatusCodes.NOT_FOUND).json({msg : `No users at this time..`})
        }

        return res.status(StatusCodes.OK).json(allProducts)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})
