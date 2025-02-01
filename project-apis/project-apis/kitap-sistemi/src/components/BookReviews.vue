<template>
  <div class="reviews-section">
    <h3>Yorumlar</h3>
    
    <!-- Yorum Ekleme Formu -->
    <div class="review-form" v-if="isLoggedIn">
      <div class="rating">
        <span 
          v-for="star in 5" 
          :key="star"
          :class="{ active: star <= newReview.rating }"
          @click="newReview.rating = star"
        >★</span>
      </div>
      <textarea 
        v-model="newReview.comment"
        placeholder="Yorumunuzu yazın..."
      ></textarea>
      <button @click="submitReview">Yorum Ekle</button>
    </div>

    <!-- Yorumlar Listesi -->
    <div class="reviews-list">
      <div v-for="review in reviews" :key="review.date" class="review-item">
        <div class="review-header">
          <div class="rating">
            <span v-for="star in 5" :key="star" :class="{ active: star <= review.rating }">★</span>
          </div>
          <span class="date">{{ formatDate(review.date) }}</span>
        </div>
        <p class="comment">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'BookReviews',
  props: {
    bookId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      reviews: [],
      newReview: {
        rating: 0,
        comment: ''
      },
      isLoggedIn: true // Gerçek auth sistemine göre değiştirilmeli
    };
  },
  methods: {
    async fetchReviews() {
      try {
        const response = await axios.get(`http://localhost:8001/reviews/${this.bookId}`);
        if (response.data && response.data.reviews) {
          this.reviews = response.data.reviews.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
        }
      } catch (error) {
        console.error('Yorumlar alınamadı:', error);
      }
    },
    async submitReview() {
      if (this.newReview.rating === 0) {
        alert('Lütfen bir puan verin');
        return;
      }
      
      try {
        const response = await axios.post('http://localhost:8001/reviews/add', {
          bookId: this.bookId,
          userId: 'user1',
          rating: this.newReview.rating,
          comment: this.newReview.comment || 'Yorum yok'
        });

        if (response.data.success) {
          this.newReview.rating = 0;
          this.newReview.comment = '';
          await this.fetchReviews();
          alert('Yorumunuz başarıyla eklendi!');
        } else {
          throw new Error('Yorum eklenemedi');
        }
      } catch (error) {
        console.error('Yorum eklenemedi:', error);
        alert('Yorum eklenirken bir hata oluştu!');
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('tr-TR');
    }
  },
  mounted() {
    this.fetchReviews();
    // Her 30 saniyede bir yorumları güncelle
    this.reviewInterval = setInterval(() => {
      this.fetchReviews();
    }, 30000);
  },
  beforeUnmount() {
    if (this.reviewInterval) {
      clearInterval(this.reviewInterval);
    }
  }
};
</script>

<style scoped>
.reviews-section {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.review-form {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.rating {
  margin-bottom: 10px;
}

.rating span {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
}

.rating span.active {
  color: #ffd700;
}

textarea {
  width: 100%;
  min-height: 100px;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.review-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.date {
  color: #666;
  font-size: 0.9em;
}

.comment {
  margin: 0;
  line-height: 1.4;
}
</style> 