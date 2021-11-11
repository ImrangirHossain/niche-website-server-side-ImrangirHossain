const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fniyp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('hitting the post')
        const database = client.db('niche-watch');
        const usersCollection = database.collection('Users');
        const watchesCollection = database.collection('Watch');
        const orderCollection = database.collection('Orders');
        const reviewCollection = database.collection('review');

        // get api
        app.get('/watches', async(req, res)=>{
            const cursor = watchesCollection.find({});
            const watches = await cursor.toArray();
            res.send(watches);
         })

        app.get('/userInfo', async(req, res)=>{
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
         })

         app.get('/orders', async(req, res)=>{
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
         })

        app.get('/review', async(req, res)=>{
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
         })

          // check admin or not
            app.get("/checkAdmin/:email", async (req, res) => {
                const result = await usersCollection
                .find({ email: req.params.email })
                .toArray();
                console.log(result);
                res.send(result);
            });

         //  GET SINGLE WATCHES
        app.get('/watches/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const watch = await watchesCollection.findOne(query);
            res.send(watch);
        })

         // POST API PRODUCTS
         app.post('/watches', async (req, res) => {
            const watch = req.body;
            const result = await watchesCollection.insertOne(watch);
            res.json(result)
        });

        //Post Add Review 
        app.post('/review', async(req, res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
         })
        
         //Post User info
         app.post("/userInfo", async (req, res) => {
            const result = await usersCollection.insertOne(req.body);
            res.send(result);
            console.log(result);
          });
         // Add Orders API 
         app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })


         //UPDATE API

        //  MAKE ADMIN
         app.put("/makeAdmin", async (req, res) => {
            const filter = { email: req.body.email };
            const requesterAccount = await usersCollection.find(filter).toArray();
            if (requesterAccount) {
              const result = await usersCollection.updateOne(filter, {
                $set: { role: "admin" },
              });
              res.json(result);
            }
        });


        //  UPDATE ORDER
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedUser.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        
        // DELETE API

        app.delete('/watches/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await watchesCollection.deleteOne(query);
            res.json(result);
        })
        app.delete('/orders/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
        
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('my server are running')
})

app.listen(port, () => {
    console.log('Running  Server on port', port);
})