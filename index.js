const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { response } = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middle Wares
app.use(cors());
app.use(express.json());

// MongoDB Uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5ctwbw8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    // MongoDb Database with Collection
    const serviceCollection = client.db("photophactory").collection("services");
    const reviewCollection = client.db("photophactory").collection("reviews");

    // JWT Token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // services api
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    // Get all Services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/homeServices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection
        .find(query)
        .sort({ $natural: -1 })
        .limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // Reviews Api
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // Delate Api
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // Update Api
    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const review = req.body;
      const option = { upsert: true };
      const updateReview = {
        $set: {
          userName: review.userName,
          userReview: review.userReview,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updateReview,
        option
      );
      res.send(result);
    });

    // Find Review By Id
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = await reviewCollection.findOne(query);
      res.send(review);
    });

    // My Review Api
    app.get("/myreviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.userEmail) {
        return res.status(403).send({ message: "Unauthorized Access" });
      }
      let query = {};
      if (req.query.userEmail) {
        query = {
          userEmail: req.query.userEmail,
        };
      }
      const cursor = reviewCollection.find(query).sort({ time: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId,
        };
      }
      const cursor = reviewCollection.find(query).sort({ time: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Photo-Phactory server is running");
});

app.listen(port, () => {
  console.log(`Photo-Phactory server is running on port ${port}`);
});
