const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const client = require('prom-client');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// METRICS
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);


// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});


// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode
    });
  });
  next();
});



// MongoDB connection string
const mongoUri = process.env.MONGO_URI

// Mongoose Model
const Item = mongoose.model('Item', { name: String });

// Connect to MongoDB and then start the server
mongoose.connect(mongoUri, {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
})
.then(() => {
  console.log("✅ Connected to MongoDB");

  // Start Server only after DB is connected
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
});

// Home route (serves public/index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CRUD Routes
app.post('/items', async (req, res) => {
  try {
    const item = new Item({ name: req.body.name });
    await item.save();
    res.status(201).send(item);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!item) return res.status(404).send({ message: 'Item not found' });
    res.send(item);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).send({ message: 'Item not found' });
    res.send({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
