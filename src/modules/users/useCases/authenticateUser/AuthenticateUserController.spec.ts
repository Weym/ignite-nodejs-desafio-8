import request from "supertest";
import { Connection } from "typeorm";
import { verify } from "jsonwebtoken";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";

import createConnection from "../../../../database";

interface User {
  name: string;
  password: string;
  email: string;
}

let connection: Connection;
let newUser: User;

describe("Authenticate User Controller: /api/v1/sessions ", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    newUser = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };

    await request(app).post("/api/v1/users").send({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should authenticate the user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: newUser.email, password: newUser.password })
      .expect("Content-Type", /json/)
      .expect(200);

    const { token, user } = response.body;
    const { secret } = authConfig.jwt;

    const verifiedToken = verify(token, secret);
    expect(verifiedToken).toBeDefined();
    expect(user.id).toBeDefined();
  });

  it("should throw error on wrong email or password", async () => {
    const incorrectEmail = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "incorrect email", password: newUser.password });

    const incorrectPassword = await request(app)
      .post("/api/v1/sessions")
      .send({ email: newUser.email, password: "incorrect password" });

    expect(incorrectEmail.body.message).toBe("Incorrect email or password");
    expect(incorrectPassword.body.message).toBe("Incorrect email or password");
  });
});
