import express from 'express';
import { create } from 'express-handlebars';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/connDB.js';
import viewRouter from './routes/viewRouter.js';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDB();

const exphbs = create({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});
app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../public'))); 
app.use(express.json());

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/', viewRouter(io)); 
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

server.listen(8080, () => {
    console.log('Servidor escuchando en el puerto 8080');
});