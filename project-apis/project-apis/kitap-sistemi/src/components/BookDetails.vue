<template>
    <div v-if="book">
      <h1>{{ book.title }}</h1>
      <p><strong>Yazar:</strong> {{ book.authors.join(", ") }}</p>
      <p><strong>Açıklama:</strong> {{ book.description }}</p>
      <img :src="book.image" alt="Book cover" v-if="book.image" />
    </div>
  </template>
  
  <script>
  export default {
    name: "BookDetails",
    data() {
      return {
        book: null
      };
    },
    created() {
      const bookId = this.$route.params.id;
      this.fetchBookDetails(bookId);
    },
    methods: {
      fetchBookDetails(bookId) {
        fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
          .then(response => response.json())
          .then(data => {
            const volumeInfo = data.volumeInfo;
            this.book = {
              title: volumeInfo.title,
              authors: volumeInfo.authors || ["Yazar bulunamadı"],
              description: volumeInfo.description || "Açıklama bulunamadı",
              image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : "",
            };
          });
      }
    }
  };
  </script>
  
  <style scoped>
  h1 {
    font-size: 2em;
    margin-bottom: 10px;
  }
  
  img {
    max-width: 200px;
    margin-top: 20px;
  }
  </style>
