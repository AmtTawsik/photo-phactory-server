const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middle Wares
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<username>:<password>@cluster0.5ctwbw8.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


app.get('/', (req,res)=>{
    res.send('Photo-Phactory server is running')
})

app.listen(port,()=>{
    console.log(`Photo-Phactory server is running on port ${port}`)
})