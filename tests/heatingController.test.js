"use strict";

jest.mock("../src/sensorService");
jest.mock("../src/boilerService");

const sensorService = require("../src/sensorService");
const boilerService = require("../src/boilerService");
const { shouldTurnOnBoiler, controlHeating } = require("../src/heatingController");

describe("Контроллер отопления – базовая логика ", () => {
  describe("Позитивные сценарии", () => {
    test('Режим "Эко": включение при разнице >= 3°C', () => {
      expect(shouldTurnOnBoiler(17, 20, "Эко").shouldTurnOn).toBe(true);
      expect(shouldTurnOnBoiler(18, 20, "Эко").shouldTurnOn).toBe(false);
    });

    test('Режим "Комфорт": включение при разнице >= 0.5°C', () => {
      expect(shouldTurnOnBoiler(21.0, 21.5, "Комфорт").shouldTurnOn).toBe(true);
      expect(shouldTurnOnBoiler(21.1, 21.5, "Комфорт").shouldTurnOn).toBe(false);
    });

    test("Обработка регистра и пробелов в названии режима", () => {
      expect(shouldTurnOnBoiler(15, 20, " эКо ").shouldTurnOn).toBe(true);
      expect(shouldTurnOnBoiler(20, 21, "кОмФоРт").shouldTurnOn).toBe(true);
    });
  });

  describe("Граничные значения", () => {
    test("Работа на пороге абсолютного нуля (-273.15°C)", () => {
      expect(() => shouldTurnOnBoiler(-273.15, 0, "Эко")).not.toThrow();
    });

    test("Точное соответствие порогу включения", () => {
      expect(shouldTurnOnBoiler(10, 13, "Эко").shouldTurnOn).toBe(true);
      expect(shouldTurnOnBoiler(20, 20.5, "Комфорт").shouldTurnOn).toBe(true);
    });
  });

  describe("Негативные сценарии", () => {
    test("Ошибка при температуре ниже абсолютного нуля", () => {
      expect(() => shouldTurnOnBoiler(-274, 20, "Эко")).toThrow("абсолютного нуля");
    });

    test("Ошибка при неизвестном режиме", () => {
      expect(() => shouldTurnOnBoiler(20, 25, "Turbo")).toThrow("Неизвестный режим работы");
    });

    test("Ошибка при неверных типах данных", () => {
      expect(() => shouldTurnOnBoiler("20", 25, "Эко")).toThrow("должны быть числами");
      expect(() => shouldTurnOnBoiler(20, "25", "Эко")).toThrow("должны быть числами");
      expect(() => shouldTurnOnBoiler(NaN, 25, "Эко")).toThrow("должны быть числами");
      expect(() => shouldTurnOnBoiler(20, NaN, "Эко")).toThrow("должны быть числами");

      expect(() => shouldTurnOnBoiler(20, 22, 123)).toThrow("должен быть строкой");
    });
  });
});

describe("Контроллер умного отопления с датчиком", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Успешные сценарии", () => {
    test("Включает котёл при низкой температуре (Эко)", async () => {
      sensorService.getInteriorTemperature.mockResolvedValue(17);
      const targetTemp = 20;

      const result = await controlHeating(targetTemp, "Эко");

      expect(result.shouldTurnOn).toBe(true);
      expect(result.currentTemp).toBe(17);
      expect(result.targetTemp).toBe(20);
      expect(result.mode).toBe("эко");

      expect(boilerService.turnOn).toHaveBeenCalledTimes(1);
      expect(boilerService.turnOff).not.toHaveBeenCalled();
    });

    test("Выключает котёл при достаточной температуре (Комфорт)", async () => {
      sensorService.getInteriorTemperature.mockResolvedValue(21.5);
      const targetTemp = 21.5;

      const result = await controlHeating(targetTemp, "Комфорт");

      expect(result.shouldTurnOn).toBe(false);
      expect(result.mode).toBe("комфорт");

      expect(boilerService.turnOff).toHaveBeenCalledTimes(1);
      expect(boilerService.turnOn).not.toHaveBeenCalled();
    });
  });

  describe("Сценарии безопасности и дребезг датчика", () => {
    test("Дребезг датчика: undefined -> ошибка безопасности и отключение котла", async () => {
      sensorService.getInteriorTemperature.mockResolvedValue(undefined);

      await expect(controlHeating(20, "Эко")).rejects.toThrow("Ошибка безопасности");

      expect(boilerService.turnOff).toHaveBeenCalledTimes(1);
      expect(boilerService.turnOn).not.toHaveBeenCalled();
    });

    test("Дребезг датчика: null -> ошибка безопасности и отключение котла", async () => {
      sensorService.getInteriorTemperature.mockResolvedValue(null);

      await expect(controlHeating(20, "Комфорт")).rejects.toThrow("Ошибка безопасности");

      expect(boilerService.turnOff).toHaveBeenCalledTimes(1);
      expect(boilerService.turnOn).not.toHaveBeenCalled();
    });

    test("Сбой сенсора (reject) -> ошибка безопасности и отключение котла", async () => {
      sensorService.getInteriorTemperature.mockRejectedValue(
        new Error("Sensor read error"),
      );

      await expect(controlHeating(20, "Эко")).rejects.toThrow("Ошибка безопасности");

      expect(boilerService.turnOff).toHaveBeenCalledTimes(1);
      expect(boilerService.turnOn).not.toHaveBeenCalled();
    });
  });
});
