import express from 'express';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';


dotenv.config();
const app = express();


app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

app.use(express.json());

app.post('/data', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }
    const saved = await prisma.user.create({
        data: {
            name: name,
            email: email
        }
    })


    if (!saved) {
        return res.status(500).json({ message: 'Failed to save data' });
    }

    res.status(201).json({ message: 'Data saved successfully', data: saved });
});





app.listen(3000, () => {
    console.log('App listening on port 3000!');
}
);  