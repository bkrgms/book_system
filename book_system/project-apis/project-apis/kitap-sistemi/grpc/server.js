const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');


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


function getBooks() {
  try {
    const books = JSON.parse(localStorage.getItem('adminBooks')) || [];
    return books;
  } catch (error) {
    console.error('Kitaplar alınamadı:', error);
    return [];
  }
}


function searchBooks(call, callback) {
  try {
    const query = call.request.query.toLowerCase();
    const books = getBooks();
    
    const results = books.filter(book => 
      book.title.toLowerCase().includes(query) || 
      book.author.toLowerCase().includes(query)
    );
    
    callback(null, { books: results });
  } catch (error) {
    console.error('Search error:', error);
    callback(null, { books: [] });
  }
}


const server = new grpc.Server();
server.addService(bookservice.BookService.service, { searchBooks });


server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error('Server başlatılamadı:', error);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
  }
);
