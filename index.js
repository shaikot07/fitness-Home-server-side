const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middlewer 
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://assignment-11-clint-side-8097e.web.app',
    'https://assignment-11-clint-side-8097e.firebaseapp.com',
    'https://assignment-11-clintside.netlify.app'

  ],
  optionSuccessStatus:200,
  credentials: true
}));



// app.use(cors())
app.use(cookieParser())
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




// middele wers 

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the medile wrer', token);
  // no token available 
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded;
    next();
  })
}




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const servicesCollection = client.db('assignment-11').collection('services')
    const bookingCollection = client.db('assignment-11').collection('booking')
    const newServicesCollection = client.db('assignment-11').collection('newservices')



    // auth related code start 
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '1h' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

      })
        .send({ success: true })
    })
    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logout user', user);
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })

    // all serveces reletade data jonno code 
    // all services pawar jonno
    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // UI theke booking korle bookings namer collection a sev hbe 
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
    })

    // send all booking data to the my booking pase to ui 
    app.get('/bookings', verifyToken, async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // booking statust relatede 
    app.patch('/bookings/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const update = req.body;
      const updateDoc = {
        $set: {
          status: update.status
        },
      }
      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // UI theke added new services korle newservices namer collection a sev hbe 
    app.post('/newservices', async (req, res) => {
      const addNewServices = req.body;
      const result = await newServicesCollection.insertOne(addNewServices)
      res.send(result)
    })
    // newServices data send to manage Services page Query by email 
    app.get('/newservices', verifyToken, async (req, res) => {

      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
        // console.log(req.query.email);
      }
      const result = await newServicesCollection.find(query).toArray();
      res.send(result);
    })

    app.patch('/newservices/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateData = req.body;
      console.log(updateData);
      const updateDoc = {
        $set: {
          img: updateData.img,
          serviceName: updateData.serviceName,
          description: updateData.description,
          price: updateData.price,
          area: updateData.area
        },
      }
      const result = await newServicesCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // delete one services ar jonno operation
    app.delete('/newservices/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await newServicesCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('simple CRUD Is RUNNING')
})

app.listen(port, () => {
  console.log(`Simple CRUD in running on port,${port}`);
})