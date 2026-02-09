"use strict";

/**
 * Заглушка сервиса управления котлом.
 * В тестах методы turnOn/turnOff мокируются для проверки корректных вызовов.
 */
async function turnOn() {
  // В реальном приложении здесь был бы вызов к оборудованию.
  return;
}

async function turnOff() {
  // В реальном приложении здесь был бы вызов к оборудованию.
  return;
}

module.exports = { turnOn, turnOff };

