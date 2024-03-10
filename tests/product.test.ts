import request from "supertest";
import app from "../src/app";

describe("API endpoint api/products", () => {
  // GET - List all products
  it("should return all products", async () => {
    const res = await request(app)
      .get("/api/products")
      .expect("Content-Type", /json/);
    expect(res.status).toEqual(200);
    
    expect(res.body).toEqual([
      { id: 123, name: 'Ketchup', price: '0.45' },
      { id: 456, name: 'Beer', price: '2.33' },
      { id: 879, name: 'Õllesnäkk', price: '0.42' },
      { id: 999, name: '75" OLED TV', price: '1333.37' }
    ]);
  });
});
