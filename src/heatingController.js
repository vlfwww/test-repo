"use strict";

const sensorService = require("./sensorService");
const boilerService = require("./boilerService");

const ABSOLUTE_ZERO = -273.15;

function shouldTurnOnBoiler(currentTemp, targetTemp, mode) {
  if (
    typeof currentTemp !== "number" ||
    typeof targetTemp !== "number" ||
    Number.isNaN(currentTemp) ||
    Number.isNaN(targetTemp)
  ) {
    throw new Error("Температуры должны быть числами.");
  }
  if (currentTemp < ABSOLUTE_ZERO || targetTemp < ABSOLUTE_ZERO) {
    throw new Error(
      "Температура не может быть ниже абсолютного нуля (-273.15°C).",
    );
  }
  if (typeof mode !== "string") {
    throw new Error("Режим работы должен быть строкой.");
  }

  const normalizedMode = mode.trim().toLowerCase();
  let threshold;

  if (normalizedMode === "эко") {
    threshold = 3.0;
  } else if (normalizedMode === "комфорт") {
    threshold = 0.5;
  } else {
    throw new Error('Неизвестный режим работы. Ожидается "Эко" или "Комфорт".');
  }

  return {
    normalizedMode,
    shouldTurnOn: targetTemp - currentTemp >= threshold,
  };
}

async function controlHeating(targetTemp, mode) {
  try {
    const currentTemp = await sensorService.getInteriorTemperature();

    if (
      currentTemp === undefined ||
      currentTemp === null ||
      typeof currentTemp !== "number" ||
      Number.isNaN(currentTemp) ||
      currentTemp < ABSOLUTE_ZERO
    ) {
      await boilerService.turnOff();
      throw new Error(
        "Ошибка безопасности: недопустимые данные датчика, котёл отключен.",
      );
    }

    const { normalizedMode, shouldTurnOn } = shouldTurnOnBoiler(
      currentTemp,
      targetTemp,
      mode,
    );

    if (shouldTurnOn) {
      await boilerService.turnOn();
    } else {
      await boilerService.turnOff();
    }

    return {
      status: "ok",
      mode: normalizedMode,
      currentTemp,
      targetTemp,
      shouldTurnOn,
    };
  } catch (error) {
    if (!/Ошибка безопасности/.test(error.message)) {
      await boilerService.turnOff();
      throw new Error(
        "Ошибка безопасности: сбой чтения с датчика, котёл отключен.",
      );
    }
    throw error;
  }
}

module.exports = { shouldTurnOnBoiler, controlHeating };
