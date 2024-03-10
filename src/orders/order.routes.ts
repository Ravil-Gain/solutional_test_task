import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as database from "./order.database";
import { ORDER_STATUS, UnitOrder } from "./order.interface";
import { statusTransition } from "../util";

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
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Status not found!` });
    }
    // Chech that status is allowed
    if (!statusTransition(order.status, status)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid order status" });
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
      return res.status(StatusCodes.NOT_FOUND).json({ error: `Not found!` });
    }
    const productsIds = req.body;
    if (!productsIds.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Products not found!` });
    }

    // if status is PAID no products adding
    if (order.status.toString() !== "NEW") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid parameters" });
    }

    // add products
    const updateOrder = await database.addProducts(req.params.id, productsIds);

    return res.status(StatusCodes.OK).json(updateOrder);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

orderRouter.patch(
  "/:id/products/:order_product_id",
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const { id, order_product_id } = req.params;

      const order: UnitOrder = await database.findOne(id);
      if (!order || !order.products.filter((p) => p.id === order_product_id)) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: `Not found!` });
      }

      // here we should check that only warehouse worker can replace products
      // and seems like only PAID orders can have replaced products;

      switch (true) {
        case "quantity" in data:
          await database.changeQuantity(id, order_product_id, data.quantity);
          break;
        case "replaced_with" in data && order.status === "PAID":
          await database.replaceProduct(
            id,
            order_product_id,
            data.replaced_with.product_id,
            data.replaced_with.quantity
          );
          break;

        default:
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: `Invalid parameters` });
      }

      return res.status(StatusCodes.OK).json();
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
);
