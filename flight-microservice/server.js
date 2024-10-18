import express from "express";
import mongoose from "mongoose";
import axios from "axios"

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongodb:27017/flightdb', { useNewUrlParser: true, useUnifiedTopology: true });

const Flights = mongoose.model('Flights', {
    flightNumber: { type: String, required: true },
    airlineId: { type: String, required: true }, // Reference to the airline
    departureAirport: { type: String, required: true },
    arrivalAirport: { type: String, required: true },
    duration: { type: String, required: true }, // e.g., "2h 30m"
    totalSeats: { type: Number, required: true },
});

// Post a new flight
app.post('/flights', async (req, res) => {
    try {
        const flight = new Flights(req.body);
        await flight.save();
        res.status(201).json(flight);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all flights
app.get('/flights', async (req, res) => {
    try {
        const flights = await Flights.find();
        res.status(200).json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a flight by ID
app.get('/flights/:id', async (req, res) => {
    try {
        const flight = await Flights.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        res.status(200).json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get all flights under an airline
app.get('/flightsUnderAnAirline', async (req, res) => {
    const { airlineId } = req.query;
    try {
        const flights = await Flights.find({ airlineId });
        res.status(200).json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get('/flights/:id/passengers', async (req, res) => {
    const flightId = req.params.id;
    try {
        const passengers = await axios.get(`http://passenger-microservice:3003/passengersByFlightId?flightId=${flightId}`);
        res.status(200).json(passengers.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Flight service running on port ${PORT}`);
});

