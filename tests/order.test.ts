import request from "supertest";
import app from "../src/app";

let orderIdToTest: string;
let orderProductId: string;

describe("API endpoint api/orders", () => {
  // POST /api/orders - create a new order
  it("should create new order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .expect("Content-Type", /json/);

    expect(res.status).toEqual(201);
    orderIdToTest = res.body.id;
  });

  // GET /api/orders/:order_id - get order details
  it("should fetch order Details", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderIdToTest}`)
      .expect("Content-Type", /json/);

    expect(res.status).toEqual(200);
    expect(res.body.products).toEqual([]);
    expect(res.body.status).toEqual("NEW");
    expect(res.body.amount).toEqual({
      discount: "0.00",
      paid: "0.00",
      returns: "0.00",
      total: "0.00",
    });
  });

  // POST /api/orders/:order_id/products - add products to the order
  it("should add products to the order", async () => {
    const res = await request(app)
      .post(`/api/orders/${orderIdToTest}/products`)
      .send([123])
      .expect("Content-Type", /json/);
    expect(res.status).toEqual(200);
    expect(res.body.products.length).toEqual(1);
    expect(res.body.amount.total).toEqual("0.45");
    orderProductId = res.body.products[0].id;
  });

  // GET /api/orders/:order_id/products - get order products
  it("should get order products", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderIdToTest}/products`)
      .expect("Content-Type", /json/);

    expect(res.body[0].product_id).toEqual(123);
    expect(res.body[0].name).toEqual("Ketchup");
    expect(res.body[0].price).toEqual("0.45");
    expect(res.body[0].quantity).toEqual(1);
    expect(res.body[0].replaced_with).toEqual(null);
  });

  // PATCH /api/orders/:order_id/products/:product_id - update product quantity
  it("should update product quantity", async () => {
    const patchRes = await request(app)
      .patch(`/api/orders/${orderIdToTest}/products/${orderProductId}`)
      .send({ quantity: 33 })
      .expect("Content-Type", /json/);
    expect(patchRes.status).toEqual(200);
  });

  // PATCH /api/orders/:order_id - update an order
  it("should update an order status", async () => {
    const patchRes = await request(app)
      .patch(`/api/orders/${orderIdToTest}`)
      .send({ status: "PAID" })
      .expect("Content-Type", /json/);
  });

  // PATCH /api/orders/:order_id/products/:product_id - add a replacement product
  it("should update an order status", async () => {
    const patchRes = await request(app)
      .patch(`/api/orders/${orderIdToTest}/products/${orderProductId}`)
      .send({ replaced_with: { product_id: 456, quantity: 6 } })
      .expect("Content-Type", /json/);
    expect(patchRes.status).toEqual(200);
  });

  // GET /api/orders/:order_id - get order details
  it("should check final result", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderIdToTest}`)
      .expect("Content-Type", /json/);

    expect(res.status).toEqual(200);

    expect(res.body.status).toEqual("PAID");
    expect(res.body.amount.paid).toEqual(res.body.amount.total);
    expect(res.body.products[0].replaced_with).not.toEqual(null);
  });
});
