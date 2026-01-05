import mongoose from 'mongoose';
import SpotsService from '../src/features/spots/spots.service.js';
import { config } from '../src/config/index.js';

const run = async () => {
  await mongoose.connect(config.MONGO_URI, { connectTimeoutMS: 5000 });
  const res = await SpotsService.search({ q: 'sree', page: 1, limit: 12 });
  console.log('service result meta:', res.meta);
  console.log('names:', res.data.map(d => d.name));
  await mongoose.disconnect();
};

run().catch((err) => { console.error(err); process.exit(1); });
