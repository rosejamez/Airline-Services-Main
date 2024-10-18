import express from "express";
import mongoose from "mongoose";
import axios from "axios";

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongodb:27017/airlinedb', { useNewUrlParser: true, useUnifiedTopology: true });

const Airlines = mongoose.model('Airlines', {
    airlineName: { type: String, required: true },
    hq: { type: String, required: true }
});

// Add a new airline
app.post('/airlines', async (req, res) => {
    try {
        const airline = new Airlines(req.body);
        await airline.save();
        res.status(201).json(airline);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all airlines
app.get('/airlines', async (req, res) => {
    try {
        const airlines = await Airlines.find();
        res.status(200).json(airlines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get an airline by ID
app.get('/airlines/:id', async (req, res) => {
    try {
        const airline = await Airlines.findById(req.params.id);
        if (!airline) {
            return res.status(404).json({ message: 'Airline not found' });
        }
        res.status(200).json(airline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all flights under an airline
app.get('/airlines/:id/flights', async (req, res) => {
    try {
        const airlineId = req.params.id;
        const flights = await axios.get(`http://flight-microservice:3002/flightsUnderAnAirline?airlineId=${airlineId}`);
        res.status(200).json(flights.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get all flights under an airline and their passengers
app.get('/airlines/:airlineId/flightsWithPassengers', async (req, res) => {
    const airlineId = req.params.airlineId;

    try {
        // Fetch all flights for the airline
        const flights = await axios.get(`http://flight-microservice:3002/flightsUnderAnAirline?airlineId=${airlineId}`);
        console.log(flights.data)

        // const flightsWithPassengersArray = [];
        // for (const flight of flights.data) {
        //     const passengersResponse = await axios.get(`http://flight-microservice:3002/flights/${flight._id}/passengers`);
        //     flightsWithPassengersArray.push({ flight, passengers: passengersResponse.data });
        // }

        // Saves time with promise.all method as the requests happens conc.
        // For each flight, fetch the passengers
        const flightsWithPassengers = await Promise.all(flights.data.map(async (flight) => {
            const passengersResponse = await axios.get(`http://flight-microservice:3002/flights/${flight._id}/passengers`);
            console.log(passengersResponse.data)

            return {
                flight,
                passengers: passengersResponse.data
            };
        }));

        res.status(200).json(flightsWithPassengers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Airline service running on port ${PORT}`);
});
