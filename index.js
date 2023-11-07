const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middlewer 
app.use(cors({
  origin:[
    'http://localhost:5175'
  ],
  credentials:true
}));
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.loifkbc.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://assigment-11:Yz9m4wCxexyD99VH@cluster0.loifkbc.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

      const servicesCollection= client.db('assignment-11').collection('services')
      const bookingCollection = client.db('assignment-11').collection('booking')
      const newServicesCollection=client.db('assignment-11').collection('newservices')



// all serveces reletade data jonno code 
// all services pawar jonno
      app.get('/services',async(req,res)=>{
            const cursor = servicesCollection.find();
            const result = await cursor.toArray();
            res.send(result)
      })
      // UI theke booking korle bookings namer collection a sev hbe 
      app.post('/bookings',async(req,res)=>{
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
      })
      // UI theke added new services korle newservices namer collection a sev hbe 
      app.post('/newservices', async(req, res)=>{
            const addNewServices = req.body;
            const result = await newServicesCollection.insertOne(addNewServices)
            res.send(result)
      })
// newServices data send to manage Services page Query by email 
      app.get('/newservices',async(req,res)=>{
        
        let query = {};
        if(req.query?.email){
          query={email:req.query.email}
          console.log(req.query.email);
        }
        const result = await newServicesCollection.find(query).toArray();
        res.send(result);
      })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res) =>{
      res.send('simple CRUD Is RUNNING')
})

app.listen(port,()=>{
      console.log(`Simple CRUD in running on port,${port}`);
})