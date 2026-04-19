const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    try {
        console.log('1. POST /api/solar-plants');
        const newPlant = {
            name: "СЕС Західна-Нова",
            installedPower: 200
        };
        let response = await fetch(`${BASE_URL}/solar-plants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPlant)
        });
        let data = await response.json();
        console.log(data);
        const newId = data.id;
        console.log('\n');

        console.log('2. GET /api/solar-plants');
        response = await fetch(`${BASE_URL}/solar-plants`);
        data = await response.json();
        console.log(data);
        console.log('\n');

        console.log(`3. POST /api/solar-plants/${newId}/readings`);
        const readings = {
            currentPower: 180.5,
            solarIrradiance: 950,
            panelTemperature: 50,
            efficiency: 19.2
        };
        response = await fetch(`${BASE_URL}/solar-plants/${newId}/readings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(readings)
        });
        data = await response.json();
        console.log(data);
        console.log('\n');

        console.log(`4. GET /api/solar-plants/${newId}/generation`);
        response = await fetch(`${BASE_URL}/solar-plants/${newId}/generation`);
        data = await response.json();
        console.log(data);
        console.log('\n');

        console.log(`5. DELETE /api/solar-plants/${newId}`);
        response = await fetch(`${BASE_URL}/solar-plants/${newId}`, {
            method: 'DELETE'
        });
        data = await response.json();
        console.log(data);
        console.log('\n');

        console.log('DONE.');
    } catch (error) {
        console.error(error.message);
    }
}

testAPI();