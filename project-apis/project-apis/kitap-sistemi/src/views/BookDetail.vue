<template>
    <div class="book-detail" v-if="book">
      <h1>{{ book.volumeInfo.title }}</h1>
      <p><strong>Yazar:</strong> {{ book.volumeInfo.authors?.join(", ") }}</p>
      <p><strong>Açıklama:</strong> {{ book.volumeInfo.description }}</p>
      <img :src="book.volumeInfo.imageLinks?.thumbnail" alt="Book cover" />
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        book: null,  // Kitap detayı
        loading: true,  // Yükleme durumu
      };
    },
    created() {
      this.fetchBookDetail(); // Detayları almak için API'yi çağır
    },
    methods: {
      fetchBookDetail() {
        const bookId = this.$route.params.id;  // URL parametresini al
        axios
          .get(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
          .then((response) => {
            this.book = response.data;  // Detayları al
            this.loading = false;
          })
          .catch((error) => {
            console.error("API Hatası:", error);
          });
      },
    },
  };
  </script>
  
  <style scoped>
  .book-detail {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .book-detail img {
    max-width: 200px;
    margin-top: 20px;
  }
  
  .book-detail h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  </style>
