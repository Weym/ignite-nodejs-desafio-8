import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

interface User {
  name: string;
  password: string;
  email: string;
}

let connection: Connection;
let userToAuthenticate: User;

describe("Get Statement Operation Controller: /api/v1/statements/:statement_id", () => {
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

  it("should be able to get a statement operation", async () => {
    const userAuthenticationResponse = await request(app).post("/api/v1/sessions").send({
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });

    const { token } = userAuthenticationResponse.body;

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 2, description: "income" })
      .set("Authorization", `Bearer ${token}`);

    const { id, amount } =
      statementResponse.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("id", id);
    expect(response.body).toHaveProperty("amount", amount.toFixed(2));
  });

  it("should not be able to get a nonexistent statement operation", async () => {
    const userAuthenticationResponse = await request(app).post("/api/v1/sessions").send({
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });

    const { token } = userAuthenticationResponse.body;

    const fakeId = uuidV4();

    await request(app)
      .get(`/api/v1/statements/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("should return 404 if trying to get a statement operation from a nonexistent user", async () => {
    const userAuthenticationResponse = await request(app).post("/api/v1/sessions").send({
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });

    const { token, user } = userAuthenticationResponse.body;

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 2, description: "income" })
      .set("Authorization", `Bearer ${token}`)

    const { id } = statementResponse.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    await request(app)
      .get(`/api/v1/statements/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
});
