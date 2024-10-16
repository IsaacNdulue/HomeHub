// const express = require('express')
// const mongoose = require('mongoose')
// const router = require ('./router/agentRouter')
// const userRouter = require ('./router/userRouter')
// const cors = require('cors')
// require('dotenv').config()
// const cron = require ('node-cron')

// const app = express()
// app.use(cors({origin:"*"}))
// app.use(express.json())

// app.use('/uploads', express.static('uploads'));
// app.use('/api', router)
// app.use('/api/user', userRouter)

// cron.schedule('0 0 * * *', () => {
//     console.log('Running daily task to remove expired sponsorships...');
//     removeExpiredSponsorships();
//   });

// const port = process.env.port
// const db = process.env.DB

// mongoose.connect(db).then(()=>{
//     console.log('database connection established')
//     app.listen(port,()=>{
//         console.log(`Server listening on ${port}`)
//     })
// }).catch((error)=>{
//     console.log(`database unable to connect ${error}`)
// })


const express = require('express');
const mongoose = require('mongoose');
const router = require('./router/agentRouter');
const userRouter = require('./router/userRouter');
const cors = require('cors');
require('dotenv').config();
const cron = require('node-cron');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use('/api', router);
app.use('/api/user', userRouter);

// Your function to remove expired sponsorships
const removeExpiredSponsorships = async () => {
    try {
        // Implement your logic here to remove expired sponsorships
        console.log('Expired sponsorships removed successfully.');
    } catch (error) {
        console.error('Error removing expired sponsorships:', error);
    }
};

// Get port and database connection string from environment variables
const port = process.env.port || 3000; // Fallback to default port if not specified
const db = process.env.DB;

// Connect to MongoDB and start the server
mongoose.connect(db)
    .then(() => {
        console.log('Database connection established');

        // Start the Express server
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);

            // Schedule the cron job to run daily at midnight after the server starts
            cron.schedule('0 0 * * *', async () => {
                console.log('Running daily task to remove expired sponsorships...');
                await removeExpiredSponsorships();
            });

            console.log('Cron job scheduled to run at midnight every day.');
        });
    })
    .catch((error) => {
        console.log(`Database connection error: ${error}`);
    });
