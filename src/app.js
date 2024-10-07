import express from 'express';
import { engine } from 'express-handlebars';
import { productsRouter } from './routes/products.js'; 
import { cartsRouter } from './routes/carts.js'; 
import { viewsRouter } from './routes/viewsRouter.js'; 
import sessionsRouter from './routes/sessionsRouter.js';
import session from 'express-session';
import { Server } from 'socket.io';
import { connDB } from './connDB.js';  
import { ProductsManager } from "./dao/ProductsManager.js"; 
import { CartsManager } from "./dao/CartsManager.js"; 
import { config } from "./config/config.js";

const app = express(); 

app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        secure: false, 
    }
}));

const PORT = config.PORT; 

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`); 
});

export const io = new Server(httpServer); 

connDB(); 

ProductsManager.path = "./src/data/products.json"; 
CartsManager.path = "./src/data/cart.json"; 

app.engine('handlebars', engine()); 
app.set('view engine', 'handlebars'); 
app.set('views', "./src/views"); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 

app.use('/', viewsRouter); 
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);

io.on("connection", socket => {
    socket.on("message", message => {
        console.log(message);
    });
});