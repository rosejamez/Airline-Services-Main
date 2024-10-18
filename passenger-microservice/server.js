import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongodb:27017/flightdb', { useNewUrlParser: true, useUnifiedTopology: true });

const Passengers = mongoose.model('Passengers', {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    nationality: { type: String, required: true },
    contactInfo: {
        email: { type: String, required: true },
        phone: { type: String }
    },
    flightId: { type: String, required: true } // Reference to the associated flight
});

// Post a new passenger
app.post('/passengers', async (req, res) => {
    try {
        const passenger = new Passengers(req.body);
        await passenger.save();
        res.status(201).json(passenger);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all passengers
app.get('/passengers', async (req, res) => {
    try {
        const passengers = await Passengers.find();
        res.status(200).json(passengers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a passenger by ID
app.get('/passengers/:id', async (req, res) => {
    try {
        const passenger = await Passengers.findById(req.params.id);
        if (!passenger) {
            return res.status(404).json({ message: 'Passenger not found' });
        }
        res.status(200).json(passenger);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



app.get('/passengersByFlightId', async (req, res) => {
    const { flightId } = req.query; // Get flightId from query parameters
    try {
        const passengers = await Passengers.find({ flightId });
        res.status(200).json(passengers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Passenger service running on port ${PORT}`);
});
