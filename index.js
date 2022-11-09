const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { response } = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle Wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5ctwbw8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('photophactory').collection('services');
        const reviewCollection = client.db('photophactory').collection('reviews');

        // services api
        app.post('/services', async(req,res)=>{
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        app.get('/services', async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/homeServices', async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query).sort({$natural:-1}).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        // Reviews Api
        app.post('/reviews', async(req,res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.delete('/reviews/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/reviews/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const review = await reviewCollection.findOne(query);
            res.send(review);
        })

        app.get('/reviews', async(req,res)=>{
            let query = {};
            if(req.query.serviceId){
                query = {
                    serviceId: req.query.serviceId,
                }
            }
            if(req.query.userEmail){
                query = {
                    userEmail: req.query.userEmail,
                }
            }
            const cursor = reviewCollection.find(query).sort({time:-1});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


    }
    finally{

    }
}

run().catch(err => console.error(err))


app.get('/', (req,res)=>{
    res.send('Photo-Phactory server is running')
})

app.listen(port,()=>{
    console.log(`Photo-Phactory server is running on port ${port}`)
})