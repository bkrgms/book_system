<template>
  <div class="home-page">
    <nav class="navbar">
      <span class="project-name">Kitap Bul</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Kitap veya yazar ara..."
        class="search-input"
        @input="handleSearch"
        :disabled="!isGrpcRunning"
      />
      <button class="logout-button" @click="logout">Çıkış Yap</button>
    </nav>

    <div class="book-grid-container">
      <div class="book-grid">
        <div v-for="book in filteredBooks" :key="book.id" class="book-card">
          <div class="book-image">
            <img :src="book.image" alt="Kitap Kapağı" />
          </div>
          <div class="book-title">{{ book.title }}</div>
          <div class="book-author">{{ book.author }}</div>
          <BookReviews :bookId="book.id.toString()" />
        </div>
      </div>
    </div>

    <div class="pagination">
      <button class="page-button" :disabled="currentPage === 1" @click="prevPage">
        Önceki
      </button>
      <span>Sayfa {{ currentPage }} / {{ totalPages }}</span>
      <button class="page-button" :disabled="currentPage === totalPages" @click="nextPage">
        Sonraki
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { getCurrentInstance } from 'vue';
import BookReviews from '@/components/BookReviews.vue';

export default {
  components: {
    BookReviews
  },
  data() {
    return {
      books: [],
      allBooks: [],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 20,
      maxBooks: 30,
      isGrpcRunning: true,
      grpcErrorShown: false
    };
  },
  setup() {
    const app = getCurrentInstance();
    const emitter = app.appContext.config.globalProperties.emitter;
    return { emitter };
  },
  computed: {
    filteredBooks() {
      const searchResults = this.books.filter(
        (book) =>
          book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      
      return searchResults.slice(start, end);
    },
    totalPages() {
      const searchResults = this.books.filter(
        (book) =>
          book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      return Math.max(1, Math.ceil(searchResults.length / this.itemsPerPage));
    }
  },
  methods: {
    async fetchBooks() {
      try {

        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        
        
        if (adminBooks.length > 0) {
          this.allBooks = adminBooks;
          this.books = [...adminBooks];
          return;
        }
        

        const response = await axios.get(
          "https://www.googleapis.com/books/v1/volumes?q=subject:classic&maxResults=40"
        );
        const rawBooks = response.data.items || [];
        

        const uniqueBooks = [];
        const usedImages = new Set();
        let id = 1;
        

        for (const item of rawBooks) {
          if (uniqueBooks.length >= this.maxBooks) break;
          
          if (item.volumeInfo.imageLinks) {
            const imageUrl = item.volumeInfo.imageLinks.thumbnail;
            const title = item.volumeInfo.title || "Bilinmeyen Başlık";
            const author = item.volumeInfo.authors ? item.volumeInfo.authors[0] : "Bilinmeyen Yazar";
            
            const isDuplicate = usedImages.has(imageUrl) || 
              uniqueBooks.some(book => 
                book.title.toLowerCase() === title.toLowerCase() &&
                book.author.toLowerCase() === author.toLowerCase()
              );
            
            if (!isDuplicate) {
              usedImages.add(imageUrl);
              uniqueBooks.push({
                id: id++,
                title: title,
                author: author,
                image: imageUrl,
              });
            }
          }
        }

        this.allBooks = uniqueBooks;
        this.books = [...uniqueBooks];
        
        //LocalStorage
        localStorage.setItem('adminBooks', JSON.stringify(uniqueBooks));
      } catch (error) {
        console.error("Kitaplar alınırken bir hata oluştu:", error);
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    logout() {
      this.$router.push("/");
    },

    refreshBooks() {
      const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
      this.books = [...adminBooks];
      
      if ((this.currentPage - 1) * this.itemsPerPage >= this.books.length) {
        this.currentPage = 1;
      }
    },
    async handleSearch() {
      if (this.searchQuery.length >= 2) {
        try {
          const response = await axios.get(`http://localhost:3000/search?query=${this.searchQuery}`);
          
          if (response.data && response.data.books) {
            this.books = response.data.books;
            this.isGrpcRunning = true;
            this.grpcErrorShown = false;
          }
        } catch (error) {

          if (error.message.includes('Network Error')) {
            this.isGrpcRunning = false;
            if (!this.grpcErrorShown) {
              alert('gRPC sunucusu (client.js) çalışmıyor. Lütfen sunucuyu başlatın.');
              this.grpcErrorShown = true;
              this.searchQuery = '';
            }
          } else {

            this.books = this.allBooks.filter(book =>
              book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
              book.author.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
            this.isGrpcRunning = true;
            this.grpcErrorShown = false;
          }
        }
      } else if (this.searchQuery.length === 0) {
        this.refreshBooks();
        this.grpcErrorShown = false;
        this.isGrpcRunning = true;
      }
    }
  },
  mounted() {
    this.fetchBooks();
    
    this.emitter.on('books-updated', () => {
      this.refreshBooks();
    });
  },
  unmounted() {
    this.emitter.off('books-updated');
  }
};
</script>

<style>
.home-page {
  font-family: Arial, sans-serif;
  padding: 10px;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f4f4f4;
  border-bottom: 1px solid #ddd;
}

.project-name {
  font-size: 24px;
  font-weight: bold;
}

.search-input {
  width: 400px;
  padding: 10px 15px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.logout-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Kitap Grid */
.book-grid-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.book-card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-card:hover {
  transform: scale(1.05);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}

.book-image {
  height: 225px;
  width: 150px;
  margin: 0 auto;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-title {
  font-size: 16px;
  font-weight: bold;
  padding: 5px 0;
}

.book-author {
  font-size: 14px;
  padding: 5px 0;
  color: #555;
}

/* Sayfalama */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.page-button {
  padding: 5px 15px;
  margin: 0 10px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
}

.page-button:disabled {
  background-color: #ccc;
}

.page-button:hover:enabled {
  background-color: #0056b3;
}

.search-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>