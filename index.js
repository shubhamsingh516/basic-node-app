import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();


app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

app.use(express.json());


await mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});


const dataSchema = new mongoose.Schema({
    data: String
});

const Data = mongoose.model('Data', dataSchema);






app.post('/data', async (req, res) => {
    const { data } = req.body;
    console.log('Received data:', data);
    const capitalizedData = data.toUpperCase();

    const saved = await Data.create({ data: capitalizedData }).then((savedData) => {
        console.log('Data saved to MongoDB:', savedData);
        return savedData;
    }).catch((err) => {
        console.error('Error saving data to MongoDB:', err);
        return null;
    })

    res.json({
        message: 'Data received and processed and saved successfully',
        originalData: data,
        processedData: capitalizedData,
        savedData: saved

    }).status(201);
});





app.listen(3000, () => {
    console.log('App listening on port 3000!');
}
);  