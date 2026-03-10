"use strict";

const ABSOLUTE_ZERO = -273.15;

function shouldTurnOnBoiler(currentTemp, targetTemp, mode) {
  if (typeof currentTemp !== "number" || typeof targetTemp !== "number" || Number.isNaN(currentTemp)) {
    throw new Error("Температуры должны быть числами.");
  }

  if (currentTemp < ABSOLUTE_ZERO) {
    throw new Error("Ошибка: температура ниже абсолютного нуля (-273.15°C).");
  }

  const normalizedMode = mode.trim().toLowerCase();
  let threshold;

  if (normalizedMode === "эко") {
    threshold = 3.0;
  } else if (normalizedMode === "комфорт") {
    threshold = 0.5;
  } else {
    throw new Error('Неизвестный режим работы.');
  }

  return {
    shouldTurnOn: (targetTemp - currentTemp) >= threshold,
  };
}

async function controlHeating(targetTemp, mode, services) {
  const currentTemp = await services.sensorService.getInteriorTemperature();

  if (currentTemp === undefined || currentTemp === null) {
    if (services.boilerService) await services.boilerService.turnOff();
    throw new Error("Ошибка безопасности: датчик недоступен");
  }

  const { shouldTurnOn } = shouldTurnOnBoiler(currentTemp, targetTemp, mode);

  if (services.boilerService) {
    if (shouldTurnOn) {
      await services.boilerService.turnOn();
    } else {
      await services.boilerService.turnOff();
    }
  }

  return {
    status: shouldTurnOn ? "heating_on" : "heating_off",
    currentTemp,
    targetTemp
  };
}

module.exports = { controlHeating };