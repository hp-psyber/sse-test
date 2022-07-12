const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
let clients = [];
const PORT = 3001;
let count = 0;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/status', (request, response) => response.json({clients: clients.length}));


app.listen(PORT, () => {
  console.log(`Events service listening at http://localhost:${PORT}`)
})

function eventsHandler(request, response, next) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);
  
    const clientId = Date.now();
    const newClient = {
      id: clientId,
      response
    };
    
    clients.push(newClient);
  
    request.on('close', () => {
      console.log(`${clientId} Connection closed`);
      clients = clients.filter(client => client.id !== clientId);
    });
  }
  
  app.get('/events', eventsHandler);

  function sendEventsToAll(newFact) {
    clients.forEach(client => {
        console.log('clientId', client.id)
        client.response.write(`data: ${JSON.stringify(newFact)}\n\n`)
    })
  }

  async function addFact(request, res, next) {
    setInterval(()=>{
        count++
        newFact = {
            "source":'server.js',
            "info":count
        }
        return sendEventsToAll(newFact);
    },2000)

  }

  addFact();