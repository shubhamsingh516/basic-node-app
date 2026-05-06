import express from 'express';
const app = express();


app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

app.use(express.json());


app.post('/data', (req, res) => {
    const { data } = req.body;
    console.log('Received data:', data);
    const capitalizedData = data.toUpperCase();

    res.json({
        message: 'Data received and processed successfully',
        originalData: data,
        processedData: capitalizedData

    }).status(201);
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
}
);  