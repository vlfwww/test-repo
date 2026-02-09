"use strict";

/**
 * Реальная реализация могла бы читать данные с физического датчика.
 * В лабораторной работе этот модуль полностью мокируется через jest.mock().
 */
async function getInteriorTemperature() {
  throw new Error("SensorService.getInteriorTemperature() не реализован.");
}

module.exports = { getInteriorTemperature };

