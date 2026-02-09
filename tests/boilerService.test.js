"use strict";

const { turnOn, turnOff } = require("../src/boilerService");

describe("boilerService (реальная реализация)", () => {
  test("turnOn() выполняется без ошибки", async () => {
    await expect(turnOn()).resolves.toBeUndefined();
  });

  test("turnOff() выполняется без ошибки", async () => {
    await expect(turnOff()).resolves.toBeUndefined();
  });
});
