
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json());
app.use('/api', taskRoutes);

mongoose.connect('mongodb://localhost:27017/taskdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(3001, () => console.log('Server running on port 3001'));
}).catch(err => console.error(err));
