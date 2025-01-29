<template>
    <div class="user-panel">
      <h1>Kullanıcı Paneli</h1>
  
      <!-- Arama Kutusu -->
      <div>
        <input v-model="searchQuery" type="text" placeholder="Kitap ara..." />
        <button @click="searchBooks">Ara</button>
      </div>
  
      <!-- Kitap Listesi -->
      <div v-if="books.length > 0">
        <h2>Arama Sonuçları</h2>
        <ul>
          <li v-for="book in books" :key="book.id">
            <strong>{{ book.title }}</strong> - {{ book.author }}
          </li>
        </ul>
      </div>
      <div v-else>
        <p>Arama sonuçları burada görünecek.</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        searchQuery: "", // Kullanıcının arama girişi
        books: [], // Arama sonuçları
      };
    },
    methods: {
      async searchBooks() {
        try {
          // gRPC API'ye arama isteği gönderme
          const response = await axios.post("http://localhost:50051", {
            keyword: this.searchQuery,
          });
          this.books = response.data.books; // Yanıtı listeye aktar
        } catch (error) {
          console.error("Kitap arama hatası:", error);
          alert("Kitap arama işlemi sırasında bir hata oluştu.");
        }
      },
    },
  };
  </script>
  
  <style>
  .user-panel {
    padding: 20px;
  }
  input {
    padding: 10px;
    margin-right: 10px;
  }
  button {
    padding: 10px;
  }
  </style>
  