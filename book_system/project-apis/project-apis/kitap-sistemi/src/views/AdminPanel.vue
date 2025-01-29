<template>
  <div class="admin-panel">
    <!-- Navbar -->
    <div class="header">
      <h1>Admin Panel</h1>
      <button class="logout-button" @click="logout">Çıkış Yap</button>
    </div>

    <!-- Kitap Tablosu -->
    <div class="book-management">
      <div class="management-header">
        <h2>Kitap Yönetimi</h2>
        <button class="add-btn" @click="openAddModal">Kitap Ekle</button>
      </div>
      <div class="book-table-container">
        <table class="book-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Resim</th>
              <th>Başlık</th>
              <th>Yazar</th>
              <th>Yorumlar</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td>{{ book.id }}</td>
              <td><img :src="book.image" :alt="book.title" class="book-image"></td>
              <td>{{ book.title }}</td>
              <td>{{ book.author }}</td>
              <td class="reviews-cell">
                <div class="rating-summary" v-if="bookReviews[book.id]">
                  <div class="average-rating">
                    <span class="stars">
                      <span v-for="star in 5" :key="star" 
                            :class="{ active: star <= bookReviews[book.id].averageRating }">★</span>
                    </span>
                    <span class="rating-text">
                      {{ bookReviews[book.id].averageRating.toFixed(1) }} 
                      ({{ bookReviews[book.id].totalReviews }} yorum)
                    </span>
                  </div>
                  <div class="recent-comments" v-if="bookReviews[book.id].recentComments.length > 0">
                    <div v-for="(comment, index) in bookReviews[book.id].recentComments" 
                         :key="index" class="comment">
                      "{{ comment }}"
                    </div>
                  </div>
                </div>
                <span v-else>Henüz yorum yok</span>
              </td>
              <td class="actions">
                <button @click="openEditModal(book)" class="edit-btn">Düzenle</button>
                <button @click="deleteBook(book.id)" class="delete-btn">Sil</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Düzenleme Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h2>Kitap Düzenle</h2>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label for="id">ID</label>
            <input v-model="editBook.id" id="id" type="text" readonly />
          </div>
          <div class="form-group">
            <label for="title">Kitap Adı</label>
            <input v-model="editBook.title" id="title" type="text" required />
          </div>
          <div class="form-group">
            <label for="author">Yazar</label>
            <input v-model="editBook.author" id="author" type="text" required />
          </div>
          <div class="form-group">
            <label for="image">Resim URL</label>
            <input v-model="editBook.image" id="image" type="url" required />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-button">Kaydet</button>
            <button type="button" @click="closeEditModal" class="cancel-button">İptal</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Kitap Ekleme Modal -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <h2>Yeni Kitap Ekle</h2>
        <form @submit.prevent="saveNewBook">
          <div class="form-group">
            <label for="newTitle">Kitap Adı</label>
            <input v-model="newBook.title" id="newTitle" type="text" required />
          </div>
          <div class="form-group">
            <label for="newAuthor">Yazar</label>
            <input v-model="newBook.author" id="newAuthor" type="text" required />
          </div>
          <div class="form-group">
            <label for="newImage">Resim URL</label>
            <input v-model="newBook.image" id="newImage" type="url" required />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-button">Kaydet</button>
            <button type="button" @click="closeAddModal" class="cancel-button">İptal</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { getCurrentInstance, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const app = getCurrentInstance();
    const emitter = app.appContext.config.globalProperties.emitter;
    
    // Kullanıcı kontrolü
    if (!store.getters.isAuthenticated) {
      router.push('/');
    }

    return { 
      store,
      emitter 
    };
  },
  data() {
    return {
      books: JSON.parse(localStorage.getItem('adminBooks')) || [],
      showEditModal: false,
      editBook: { id: "", title: "", author: "", image: "" },
      showAddModal: false,
      newBook: { title: "", author: "", image: "" },
      maxBooks: 30,
      bookReviews: reactive({}),
      reviewsInterval: null,
    };
  },
  methods: {
    saveToLocalStorage() {
      localStorage.setItem('adminBooks', JSON.stringify(this.books));
      this.store.dispatch('setBooks', this.books);
      this.emitter.emit('books-updated', this.books);
    },
    async fetchBooks() {
      if (this.books.length === 0) {
        try {
          // Farklı yazarlar için arama sorguları
          const queries = [
            'sherlock+holmes+doyle',
            'agatha+christie',
            'dan+brown',
            'stephen+king',
            'j.k.+rowling',
            'george+orwell',
            'jules+verne'
          ];

          let allBooks = [];
          
          // Her yazar için arama yap
          for (const query of queries) {
            const response = await axios.get(
              `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`
            );
            
            if (response.data.items) {
              allBooks = [...allBooks, ...response.data.items];
            }
          }

          // Benzersiz kitapları filtrele
          const uniqueBooks = [];
          const usedImages = new Set();
          let id = 1;

          // Karıştır ve maxBooks kadar al
          allBooks = allBooks.sort(() => Math.random() - 0.5);
          
          for (const item of allBooks) {
            if (uniqueBooks.length >= this.maxBooks) break;

            if (item.volumeInfo.imageLinks && item.volumeInfo.authors) {
              const imageUrl = item.volumeInfo.imageLinks.thumbnail;
              const title = item.volumeInfo.title || "Bilinmeyen Başlık";
              const author = item.volumeInfo.authors[0] || "Bilinmeyen Yazar";

              // Hem resim hem de başlık-yazar kombinasyonu benzersiz olmalı
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

          this.books = uniqueBooks;
          this.saveToLocalStorage();
        } catch (error) {
          console.error("Kitaplar alınırken bir hata oluştu:", error);
        }
      }
    },
    openEditModal(book) {
      this.editBook = { ...book };
      this.showEditModal = true;
    },
    saveEdit() {
      if (!this.isBookUnique(this.editBook, this.editBook.id)) {
        alert("Bu kitap zaten mevcut veya aynı resim URL'sine sahip başka bir kitap var!");
        return;
      }

      const index = this.books.findIndex(book => book.id === this.editBook.id);
      if (index !== -1) {
        this.books[index] = { ...this.editBook };
        this.saveToLocalStorage();
        alert("Kitap başarıyla güncellendi!");
      }
      this.closeEditModal();
    },
    deleteBook(id) {
      const index = this.books.findIndex(book => book.id === id);
      if (index !== -1) {
        if (confirm("Bu kitabı silmek istediğinizden emin misiniz?")) {
          this.books.splice(index, 1);
          this.reorderBookIds();
          this.saveToLocalStorage();
          alert("Kitap başarıyla silindi!");
        }
      }
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editBook = { id: "", title: "", author: "", image: "" };
    },
    logout() {
      this.$router.push("/");
    },
    openAddModal() {
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
      this.newBook = { title: "", author: "", image: "" };
    },
    saveNewBook() {
      if (!this.isBookUnique(this.newBook)) {
        alert("Bu kitap zaten mevcut veya aynı resim URL'sine sahip başka bir kitap var!");
        return;
      }

      const maxId = Math.max(...this.books.map(b => parseInt(b.id)), 0);
      const newBook = {
        id: maxId + 1,
        title: this.newBook.title,
        author: this.newBook.author,
        image: this.newBook.image || "https://via.placeholder.com/150x225"
      };
      this.books.push(newBook);
      this.saveToLocalStorage();
      this.closeAddModal();
    },
    isBookUnique(newBook, excludeId = null) {
      return !this.books.some(book => {
        if (book.id === excludeId) return false;
        
        // Aynı kapak fotosu kontrolü
        if (book.image === newBook.image) return true;
        
        // Başlık ve yazar kontrolü (büyük/küçük harf duyarsız)
        const sameTitle = book.title.toLowerCase() === newBook.title.toLowerCase();
        const sameAuthor = book.author.toLowerCase() === newBook.author.toLowerCase();
        
        return sameTitle && sameAuthor;
      });
    },
    reorderBookIds() {
      this.books = this.books
        .sort((a, b) => a.id - b.id) // Önce mevcut ID'lere göre sırala
        .map((book, index) => ({
          ...book,
          id: index + 1 // Yeni ID'leri ata
        }));
    },
    async fetchBookReviews() {
      for (const book of this.books) {
        try {
          const response = await axios.get(`http://localhost:8001/reviews/${book.id}`);
          
          if (response.data && response.data.reviews) {
            const reviews = response.data.reviews;
            const totalReviews = reviews.length;
            
            if (totalReviews > 0) {
              const averageRating = reviews.reduce((acc, review) => acc + Number(review.rating), 0) / totalReviews;
              const recentComments = reviews
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 2)
                .map(review => review.comment);
              
              this.bookReviews[book.id] = {
                averageRating,
                totalReviews,
                recentComments
              };
            }
          }
        } catch (error) {
          console.error(`${book.title} için yorumlar alınamadı:`, error);
        }
      }
    }
  },
  async mounted() {
    await this.fetchBooks();
    await this.fetchBookReviews();
    
    // Her 10 saniyede bir yorumları güncelle
    this.reviewsInterval = setInterval(() => {
      this.fetchBookReviews();
    }, 10000);
  },
  beforeUnmount() {
    // Component unmount olmadan önce interval'i temizle
    if (this.reviewsInterval) {
      clearInterval(this.reviewsInterval);
    }
  },
  beforeMount() {
    // Kullanıcı kontrolü
    if (!this.store.getters.isAuthenticated) {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.admin-panel {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: normal;
}

.logout-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.book-management {
  margin-top: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.book-management h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.book-table {
  width: 100%;
  border-collapse: collapse;
}

.book-table th,
.book-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.book-table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  background-color: #ffc107;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.save-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #218838;
}

.book-thumbnail {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
}

.book-table td {
  vertical-align: middle;
}

.reviews-cell {
  max-width: 250px;
  padding: 10px;
}

.rating-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #ddd;
  font-size: 18px;
}

.stars .active {
  color: #ffd700;
}

.rating-text {
  font-size: 14px;
  color: #666;
}

.recent-comments {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.comment {
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-image {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
}
</style>