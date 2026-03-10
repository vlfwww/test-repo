const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('expect');
const { controlHeating } = require('../../src/heatingController');

let currentTemp;
let result;
let errorMsg;

Given('Датчик температуры показывает {int} градусов', function (temp) {
    currentTemp = temp;
    errorMsg = null;
    result = null;
});

Given('Датчик температуры неисправен', function () {
    currentTemp = null;
    errorMsg = null;
    result = null;
});

When('Я устанавливаю режим {string} и цель {int} градусов', async function (mode, target) {
    const services = {
        sensorService: { getInteriorTemperature: async () => currentTemp },
        boilerService: { turnOn: async () => {}, turnOff: async () => {} }
    };
    try {
        result = await controlHeating(target, mode, services);
    } catch (e) {
        errorMsg = e.message;
    }
});

When('Я запрашиваю состояние системы', async function () {
    const services = {
        sensorService: { getInteriorTemperature: async () => currentTemp },
        boilerService: { turnOff: async () => {} }
    };
    try {
        result = await controlHeating(20, "Эко", services);
    } catch (e) {
        errorMsg = e.message;
    }
});

Then('Статус котла должен быть {string}', function (status) {
    expect(result.status).toBe(status);
});

Then('Должна возникнуть ошибка {string}', function (msg) {
    expect(errorMsg).toContain(msg);
});