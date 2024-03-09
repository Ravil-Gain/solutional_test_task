import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as database from "./order.database";
import { ORDER_STATUS, UnitOrder } from "./order.interface";


export const orderRouter = express.Router();

orderRouter.get("/", async (req: Request, res: Response) => {
  try {
    const allOrders: UnitOrder[] = await database.findAll();

    if (!allOrders) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No users at this time..` });
    }

    return res.status(StatusCodes.OK).json(allOrders);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

orderRouter.post("/", async (req: Request, res: Response) => {
  try {
    const newOrder = await database.create();

    return res.status(StatusCodes.CREATED).json(newOrder);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

orderRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const order: UnitOrder = await database.findOne(req.params.id);

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Order not found!` });
    }

    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

orderRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await database.findOne(id);

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Order not found!` });
    }

    const newStatus: ORDER_STATUS.NEW | ORDER_STATUS.PAID = <ORDER_STATUS>(
      parseInt(ORDER_STATUS[<any>status])
    );
    if (!newStatus) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Status not found!` });
    }
    const updateOrder = await database.changeStatus(id, status);
    return res.status(StatusCodes.OK).json(updateOrder);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

orderRouter.get("/:id/products", async (req: Request, res: Response) => {
  try {
    const order: UnitOrder = await database.findOne(req.params.id);

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Order not found!` });
    }

    return res.status(StatusCodes.OK).json(order.products);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

orderRouter.post("/:id/products", async (req: Request, res: Response) => {
  try {
    const order: UnitOrder = await database.findOne(req.params.id);
    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Order not found!` });
    }
    const productsIds = req.body
    if (!productsIds.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Products not found!` });
    }

    // set products
    const updateOrder = await database.addProducts(req.params.id, productsIds);
    return res.status(StatusCodes.OK).json(updateOrder);

    // // fetch all products by iDs
    // const products: UnitProduct[] = (await products_database.findAll()).filter(
    //   (p) => productsIds.includes(p.id)
    // );

    // if (!products.length) {
    //   return res
    //     .status(StatusCodes.NOT_FOUND)
    //     .json({ error: `Error resolving ProductIds` });
    // }

    // order.amount = calculateOrderAmounts(products);
    // order.products = products;



    return res.status(StatusCodes.OK).json(order.products);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});
