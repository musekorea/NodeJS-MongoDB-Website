import 'dotenv/config';
import { app } from './app.js';
import { connectDB } from './db.js';

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`💚 Server is listening on Port 8080`);
});
