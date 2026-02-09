"use strict";

const { getInteriorTemperature } = require("../src/sensorService");

describe("sensorService (реальная реализация)", () => {
  test("getInteriorTemperature() выбрасывает ошибку (заглушка не реализована)", async () => {
    await expect(getInteriorTemperature()).rejects.toThrow(
      "SensorService.getInteriorTemperature() не реализован."
    );
  });
});
