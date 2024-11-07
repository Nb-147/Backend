import express from 'express';
import { engine } from 'express-handlebars';
import { productsRouter } from './routes/productsRouter.js'; 
import { cartsRouter } from './routes/cartsRouter.js'; 
import { viewsRouter } from './routes/viewsRouter.js'; 
import sessionsRouter from './routes/sessionsRouter.js';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { connDB } from './connDB.js';  
import { config } from "./config/config.js";
import { initPassport } from './config/passport.config.js';
import passport from 'passport';

const app = express(); 

await connDB(config.MONGO_URL, config.DB_NAME); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 
app.use(cookieParser());

initPassport();
app.use(passport.initialize()); 

app.engine('handlebars', engine()); 
app.set('view engine', 'handlebars'); 
app.set('views', "./src/views"); 

app.use('/', viewsRouter); 
app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);

const PORT = config.PORT; 
const httpServer = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`); 
});
export const io = new Server(httpServer); 

io.on("connection", socket => {
    console.log('New client connected');
    socket.on("message", message => {
        console.log(message);
    });
});
