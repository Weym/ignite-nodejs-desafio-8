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

describe("Create Statement Controller: /api/v1/statements/*", () => {
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

  it("should be able to create a deposit", async () => {
    const user = await request(app).post("/api/v1/sessions").send({
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });

    const { token } = user.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 2, description: "income" })
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(response.body).toHaveProperty("description", "income");
    expect(response.body).toHaveProperty("amount", 2);
  });

  it("should be able to create a withdraw", async () => {
    const user = await request(app).post("/api/v1/sessions").send({
      email: userToAuthenticate.email,
      password: userToAuthenticate.password,
    });

    const token = user.body.token;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 1, description: "rental", })
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(response.body).toHaveProperty("amount", 1);
    expect(response.body).toHaveProperty("type", "withdraw");
  });


  it("should not be able to create a withdraw with insufficient funds", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userToAuthenticate.email, password: userToAuthenticate.password });

    const { token } = authenticationResponse.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 10, description: "rental" })
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(response.body.message).toBe("Insufficient funds");
  });

  it("should not be able to create statement from a nonexistent user", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: userToAuthenticate.email, password: userToAuthenticate.password });

    const { token, user } = authenticationResponse.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 1, description: "income" })
      .set({ Authorization: `Bearer ${token}` })
      .expect(404);
  });
});
