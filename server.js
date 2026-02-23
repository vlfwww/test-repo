"use strict";

const express = require('express');
const app = express();

app.use(express.json());

const { controlHeating } = require('./src/heatingController');
const sensorService = require('./src/sensorService');

app.get('/api/sensors/room-temp', (req, res) => {
    console.log("Получен запрос №1: чтение температуры с датчика");
    res.status(200).json({
        status: "success",
        temperature: 18.5, 
        unit: "Celsius"
    });
});

app.post('/api/heating/control', async (req, res) => {
    try {
        const { targetTemp, mode } = req.body;

        console.log(`Получен запрос №2: цель=${targetTemp}, режим=${mode}`);

        sensorService.getInteriorTemperature = async () => 18.5;

        const result = await controlHeating(targetTemp, mode);
        
        res.status(200).json(result);

    } catch (error) {
        console.error("Бизнес-ошибка:", error.message);
        
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`СЕРВЕР ЗАПУЩЕН`);
});