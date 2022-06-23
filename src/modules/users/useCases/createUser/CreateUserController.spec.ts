import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";

import createConnection from "../../../../database";
import { CreateUserError } from "./CreateUserError";

let connection: Connection;

describe("Create User Controller: /api/v1/users", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "name",
      email: "email@email.com",
      password: "password",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to create a user with an already registered email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "name",
      email: "email@email.com",
      password: "password",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "name",
      email: "email@email.com",
      password: "password",
    });

    expect(response.statusCode).toBe(400);
  });
});
