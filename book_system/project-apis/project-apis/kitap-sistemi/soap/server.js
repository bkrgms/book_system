const soap = require('soap');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const reviews = new Map();

const service = {   
  BookReviewService: {
    BookReviewPort: {
      addReview: function(args) {
        const review = {
          bookId: args.bookId,
          userId: args.userId,
          rating: parseInt(args.rating),
          comment: args.comment,
          date: new Date().toISOString()
        };

        if (!reviews.has(args.bookId)) {
          reviews.set(args.bookId, []);
        }
        reviews.get(args.bookId).push(review);

        return {
          success: true,
          reviewId: Date.now().toString()
        };
      },
      getReviews: function(args) {
        const bookReviews = reviews.get(args.bookId) || [];
        return {
          reviews: bookReviews
        };
      }
    }
  }
};


const wsdlPath = path.join(__dirname, 'book_service.wsdl');
const xml = require('fs').readFileSync(wsdlPath, 'utf8');


app.post('/reviews/add', (req, res) => {
  try {
    const result = service.BookReviewService.BookReviewPort.addReview(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Yorum eklenemedi' });
  }
});

app.get('/reviews/:bookId', (req, res) => {
  try {
    const bookReviews = reviews.get(req.params.bookId) || [];
    res.json({ reviews: bookReviews });
  } catch (error) {
    res.status(500).json({ error: 'Yorumlar alınamadı' });
  }
});

app.listen(8001, function() {
  soap.listen(app, '/book-reviews', service, xml);
  console.log('SOAP server running on port 8001');
});
