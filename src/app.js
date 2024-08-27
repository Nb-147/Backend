const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const exphbs = create({ defaultLayout: 'main' });
app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.static('public'));

const viewRouter = require('./routes/viewRouter')(io);
const productsRouter = require('./routes/products')(io); 
app.use('/', viewRouter);
app.use('/api/products', productsRouter);

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server online on port ${PORT}`);
});