"use strict";

function shouldTurnOnBoiler(currentTemp, targetTemp, mode) {
  const ABSOLUTE_ZERO = -273.15;

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

  return targetTemp - currentTemp >= threshold;
}

module.exports = { shouldTurnOnBoiler };
