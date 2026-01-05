import mongoose from 'mongoose';
import TouristSpot from '../src/models/TouristSpot.js';
import { config } from '../src/config/index.js';

const run = async () => {
  await mongoose.connect(config.MONGO_URI, { connectTimeoutMS: 5000 });
  console.log('Connected');
  const cnt = await TouristSpot.countDocuments({ name: { $regex: /^sree/i } });
  console.log('count /^sree/i =', cnt);
  const docs = await TouristSpot.find({ name: { $regex: /^sree/i } });
  console.log('docs:', docs.map(d => d.name));
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
