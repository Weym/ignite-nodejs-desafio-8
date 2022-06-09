import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateStatementError } from "./CreateStatementError";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "name",
      email: "email@email.com",
      password: "password",
    });
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 5,
      description: "deposit 5",
    });

    expect(statement).toBeDefined();
    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create statement if user doesn't exist", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "id that doesn't exist",
        type: OperationType.DEPOSIT,
        amount: 5,
        description: "deposit 5",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw statement if trying to withdraw a value bigger than the user's balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "name",
      email: "email@email.com",
      password: "password",
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 5,
        description: "deposit 5",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
