import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

interface User {
  name: string;
  password: string;
  email: string;
}

let connection: Connection;
let userToAuthenticate: User;

describe("Get Balance Controller: /api/v1/statements/balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    userToAuthenticate = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };

    await request(app).post("/api/v1/users").send({
      name: userToAuthenticate.name,
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a balance", async () => {
    const userAuthenticationResponse = await request(app).post("/api/v1/sessions").send({
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });

    const { token } = userAuthenticationResponse.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("balance");
  });

  it("should not be able to get a balance from a nonexistent user", async () => {
    const userAuthenticationResponse = await request(app).post("/api/v1/sessions").send({
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });

    const { token, user } = userAuthenticationResponse.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
});
