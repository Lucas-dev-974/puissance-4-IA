import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app: Express = express();
const port = process.env.APP_PORT;

app.get('/', (req: Request, res: Response) => {
  res.send("l'application puissance 4 API est en cour de de construction, teste 1");
});

const httpServer = new HTTPServer(app)
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
})

// Websoket
const io = new Server(httpServer, {
  cors:{
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("connexion effectué");
});