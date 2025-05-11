const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  capacity: { type: Number, required: true },
  available: { type: Number, required: true },
  rate: { type: Number, required: true },
  ratings: { type: [Number], default: [] }, // Array to store ratings
});

const ParkingLot = mongoose.model("ParkingLot", parkingLotSchema);

module.exports = ParkingLot;