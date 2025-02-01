<template>
    <div>
      <div class="book" v-for="book in books" :key="book.id">
        <h2>{{ book.title }}</h2>
        <p>{{ book.authors.join(", ") }}</p>
        <button @click="viewDetails(book.id)">Detayları Gör</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "BooksList",
    data() {
      return {
        books: [],
      };
    },
    created() {
      this.fetchBooks();
    },
    methods: {
      fetchBooks() {
        fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction')
          .then(response => response.json())
          .then(data => {
            this.books = data.items.map(item => ({
              id: item.id,
              title: item.volumeInfo.title,
              authors: item.volumeInfo.authors || ["Yazar bulunamadı"],
              description: item.volumeInfo.description || "Açıklama bulunamadı",
              image: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : "",
            }));
          });
      },
      viewDetails(bookId) {
        this.$router.push({ name: 'BookDetails', params: { id: bookId } });
      }
    }
  };
  </script>
  
  <style scoped>
  .book {
    margin-bottom: 20px;
  }
  
  button {
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>