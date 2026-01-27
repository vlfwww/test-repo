"use strict";
const { shouldTurnOnBoiler } = require("../src/heatingController");

describe("Контроллер отопления", () => {
  
  describe("Позитивные сценарии", () => {
    test('Режим "Эко": включение при разнице >= 3°C', () => {
      expect(shouldTurnOnBoiler(17, 20, "Эко")).toBe(true);
      expect(shouldTurnOnBoiler(18, 20, "Эко")).toBe(false);
    });

    test('Режим "Комфорт": включение при разнице >= 0.5°C', () => {
      expect(shouldTurnOnBoiler(21.0, 21.5, "Комфорт")).toBe(true);
      expect(shouldTurnOnBoiler(21.1, 21.5, "Комфорт")).toBe(false);
    });

    test("Обработка регистра и пробелов в названии режима", () => {
      expect(shouldTurnOnBoiler(15, 20, " эКо ")).toBe(true);
      expect(shouldTurnOnBoiler(20, 21, "кОмФоРт")).toBe(true);
    });
  });

  describe("Граничные значения", () => {
    test("Работа на пороге абсолютного нуля (-273.15°C)", () => {
      expect(() => shouldTurnOnBoiler(-273.15, 0, "Эко")).not.toThrow();
    });

    test("Точное соответствие порогу включения", () => {
      expect(shouldTurnOnBoiler(10, 13, "Эко")).toBe(true); // 3.0
      expect(shouldTurnOnBoiler(20, 20.5, "Комфорт")).toBe(true); // 0.5
    });
  });

  describe("Негативные сценарии (ошибки)", () => {
    test("Ошибка при температуре ниже абсолютного нуля", () => {
      expect(() => shouldTurnOnBoiler(-274, 20, "Эко")).toThrow("абсолютного нуля");
    });

    test("Ошибка при неизвестном режиме", () => {
      expect(() => shouldTurnOnBoiler(20, 25, "Turbo")).toThrow("Неизвестный режим работы");
    });

    test("Ошибка при неверных типах данных (Full Coverage)", () => {
      expect(() => shouldTurnOnBoiler("20", 25, "Эко")).toThrow("должны быть числами"); 
      expect(() => shouldTurnOnBoiler(20, "25", "Эко")).toThrow("должны быть числами");
      expect(() => shouldTurnOnBoiler(NaN, 25, "Эко")).toThrow("должны быть числами");  
      expect(() => shouldTurnOnBoiler(20, NaN, "Эко")).toThrow("должны быть числами");  
      
      expect(() => shouldTurnOnBoiler(20, 22, 123)).toThrow("должен быть строкой");
    });
  });
});