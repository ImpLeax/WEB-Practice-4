const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 3000;

app.use(express.json());

let db;

(async () => {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS solar_plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            installedPower REAL NOT NULL,
            currentPower REAL DEFAULT 0,
            dailyGeneration REAL DEFAULT 0,
            solarIrradiance REAL DEFAULT 0,
            panelTemperature REAL DEFAULT 20,
            efficiency REAL DEFAULT 0,
            status TEXT DEFAULT 'active'
        )
    `);
})();

app.get('/api/solar-plants', async (req, res) => {
    const { status } = req.query;
    if (status) {
        const plants = await db.all('SELECT * FROM solar_plants WHERE status = ?', [status]);
        return res.json(plants);
    }
    const plants = await db.all('SELECT * FROM solar_plants');
    res.json(plants);
});

app.get('/api/solar-plants/:id', async (req, res) => {
    const plant = await db.get('SELECT * FROM solar_plants WHERE id = ?', [req.params.id]);
    if (!plant) return res.status(404).json({ error: 'СЕС не знайдена' });
    res.json(plant);
});

app.get('/api/solar-plants/:id/generation', async (req, res) => {
    const plant = await db.get('SELECT currentPower, dailyGeneration, efficiency, solarIrradiance FROM solar_plants WHERE id = ?', [req.params.id]);
    if (!plant) return res.status(404).json({ error: 'СЕС не знайдена' });
    res.json(plant);
});

app.post('/api/solar-plants', async (req, res) => {
    const { name, installedPower, currentPower = 0, dailyGeneration = 0, solarIrradiance = 0, panelTemperature = 20, efficiency = 0, status = 'active' } = req.body;
    
    if (!name || !installedPower) {
        return res.status(400).json({ error: "Відсутні обов'язкові поля" });
    }

    const result = await db.run(
        `INSERT INTO solar_plants (name, installedPower, currentPower, dailyGeneration, solarIrradiance, panelTemperature, efficiency, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, installedPower, currentPower, dailyGeneration, solarIrradiance, panelTemperature, efficiency, status]
    );
    
    const newPlant = await db.get('SELECT * FROM solar_plants WHERE id = ?', [result.lastID]);
    res.status(201).json(newPlant);
});

app.post('/api/solar-plants/:id/readings', async (req, res) => {
    const plant = await db.get('SELECT * FROM solar_plants WHERE id = ?', [req.params.id]);
    if (!plant) return res.status(404).json({ error: 'СЕС не знайдена' });

    const currentPower = req.body.currentPower !== undefined ? req.body.currentPower : plant.currentPower;
    const solarIrradiance = req.body.solarIrradiance !== undefined ? req.body.solarIrradiance : plant.solarIrradiance;
    const panelTemperature = req.body.panelTemperature !== undefined ? req.body.panelTemperature : plant.panelTemperature;
    const efficiency = req.body.efficiency !== undefined ? req.body.efficiency : plant.efficiency;

    await db.run(
        'UPDATE solar_plants SET currentPower = ?, solarIrradiance = ?, panelTemperature = ?, efficiency = ? WHERE id = ?',
        [currentPower, solarIrradiance, panelTemperature, efficiency, req.params.id]
    );

    const updatedPlant = await db.get('SELECT * FROM solar_plants WHERE id = ?', [req.params.id]);
    res.json(updatedPlant);
});

app.put('/api/solar-plants/:id', async (req, res) => {
    const plant = await db.get('SELECT * FROM solar_plants WHERE id = ?', [req.params.id]);
    if (!plant) return res.status(404).json({ error: 'СЕС не знайдена' });

    const updatedData = { ...plant, ...req.body };

    await db.run(
        `UPDATE solar_plants SET name = ?, installedPower = ?, currentPower = ?, dailyGeneration = ?, solarIrradiance = ?, panelTemperature = ?, efficiency = ?, status = ? WHERE id = ?`,
        [updatedData.name, updatedData.installedPower, updatedData.currentPower, updatedData.dailyGeneration, updatedData.solarIrradiance, updatedData.panelTemperature, updatedData.efficiency, updatedData.status, req.params.id]
    );

    const updatedPlant = await db.get('SELECT * FROM solar_plants WHERE id = ?', [req.params.id]);
    res.json(updatedPlant);
});

app.delete('/api/solar-plants/:id', async (req, res) => {
    const plant = await db.get('SELECT * FROM solar_plants WHERE id = ?', [req.params.id]);
    if (!plant) return res.status(404).json({ error: 'СЕС не знайдена' });

    await db.run('DELETE FROM solar_plants WHERE id = ?', [req.params.id]);
    res.json(plant);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});