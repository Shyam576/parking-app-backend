const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ParkingLot = require("./models/parkingLot");
const dmsToDecimal = require("./util");


const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb+srv://haengboghage17:WIlcWz4rmts9DNEP@cluster0.izfuwro.mongodb.net/parking-management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Create a parking lot
app.post("/api/parking", async (req, res) => {
  try {
    const { name, latitude, longitude, capacity, available, rate } = req.body;

    const formattedLatitude = typeof latitude === "string"
    ? dmsToDecimal(latitude.slice(0, -1), latitude.slice(-1)) // Extract value and direction
    : latitude;

  const formattedLongitude = typeof longitude === "string"
    ? dmsToDecimal(longitude.slice(0, -1), longitude.slice(-1)) // Extract value and direction
    : longitude;

  const newParkingLot = new ParkingLot({
    name,
    latitude: formattedLatitude,
    longitude: formattedLongitude,
    capacity,
    available,
    rate,
  });

    const savedParkingLot = await newParkingLot.save();
    res.status(201).json(savedParkingLot);
  } catch (error) {
    console.error("Error creating parking lot:", error);
    res.status(500).json({ error: "Failed to create parking lot" });
  }
});

// Fetch all parking lots
app.get("/api/parking/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Haversine formula to calculate distance between two points
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Fetch all parking lots and filter by distance
    const parkingLots = await ParkingLot.find();
    const nearbyParkingLots = parkingLots.filter((lot) => {
      const distance = haversineDistance(userLat, userLng, lot.latitude, lot.longitude);
      return distance <= radiusKm; // Include only parking lots within the radius
    });

    res.json(nearbyParkingLots);
  } catch (error) {
    console.error("Error fetching parking lots:", error);
    res.status(500).json({ error: "Failed to fetch parking lots" });
  }
});

// Book a parking spot
app.post("/api/parking/book", async (req, res) => {
  try {
    const { id } = req.body;

    const parkingLot = await ParkingLot.findById(id);
    if (parkingLot && parkingLot.available > 0) {
      parkingLot.available -= 1;
      await parkingLot.save();
      res.json({ success: true, message: "Booking successful", parkingLot });
    } else {
      res.status(400).json({ success: false, message: "No spots available" });
    }
  } catch (error) {
    console.error("Error booking parking lot:", error);
    res.status(500).json({ error: "Failed to book parking lot" });
  }
});

// Submit a rating
app.post("/api/parking/rate", async (req, res) => {
  try {
    const { id, rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const parkingLot = await ParkingLot.findById(id);
    if (parkingLot) {
      parkingLot.ratings.push(rating);
      await parkingLot.save();
      res.json({ success: true, message: "Rating submitted", parkingLot });
    } else {
      res.status(404).json({ error: "Parking lot not found" });
    }
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});