const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());


const PROTO_PATH = path.resolve(__dirname, '../proto/book.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const bookservice = protoDescriptor.bookservice;


const client = new bookservice.BookService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);


app.get('/search', (req, res) => {
  const query = req.query.query || '';
  
  client.searchBooks({ query }, (error, response) => {
    if (error) {
      console.error('gRPC error:', error.code);
      return res.status(503).json({ 
        error: 'gRPC sunucusu çalışmıyor',
        isGrpcRunning: false 
      });
    }
    res.json({ ...(response || { books: [] }), isGrpcRunning: true });
  });
});


app.get('/health', (req, res) => {
  client.searchBooks({ query: '' }, (error) => {
    if (error) {
      res.status(503).json({ status: 'error', isGrpcRunning: false });
    } else {
      res.json({ status: 'ok', isGrpcRunning: true });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`REST server running on port ${PORT}`);
});
