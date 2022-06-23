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
let user: User;

describe("Show User Profile Controller: /api/v1/profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: "name",
      email: "email@email.com",
      password: "password",
    };

    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should get user profile on authorized user", async () => {
    const authenticationResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: user.email, password: user.password });

    const { user: authenticatedUser, token } = authenticationResponse.body;

    const profileResponse = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(profileResponse.body.id).toEqual(authenticatedUser.id);
  });

  it("should fail when missing authorization header", async () => {
    await request(app).get("/api/v1/profile").expect(401);
  });

  it("should fail when invalid JWT", async () => {
    await request(app)
      .get("/api/v1/profile")
      .set("Authorization", "Bearer invalid token")
      .expect(401);
  });
});
