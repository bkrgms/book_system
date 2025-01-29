<template>
  <div class="login-page">
    <!-- Başlık ve Slogan -->
    <div class="header">
      <h1>Kitap Bul</h1>
      <p>Aradığın tüm kitaplar elinin altında!</p>
    </div>

    <!-- Seçenekler -->
    <div class="selection-container">
      <div class="option" @click="handleAdminLogin">
        <i class="fas fa-user-shield icon"></i>
        <p>Yönetici Girişi</p>
      </div>
      <div class="option" @click="handleUserLogin">
        <i class="fas fa-user icon"></i>
        <p>Kullanıcı Girişi</p>
      </div>
    </div>

    <!-- Admin Giriş Modal -->
    <div v-if="showAdminModal" class="modal">
      <div class="modal-content">
        <h2>Yönetici Girişi</h2>
        <form @submit.prevent="submitAdminLogin">
          <input v-model="username" type="text" placeholder="Kullanıcı Adı" required>
          <input v-model="password" type="password" placeholder="Şifre" required>
          <div class="modal-actions">
            <button type="submit">Giriş</button>
            <button type="button" @click="closeModal">İptal</button>
          </div>
        </form>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const showAdminModal = ref(false);
    const errorMessage = ref('');

    const handleAdminLogin = () => {
      showAdminModal.value = true;
    };

    const handleUserLogin = () => {
      router.push('/home');
    };

    const submitAdminLogin = () => {
      const adminCredentials = {
        username: "adming",
        password: "123456"
      };

      if (
        username.value === adminCredentials.username && 
        password.value === adminCredentials.password
      ) {
        store.dispatch('login', { username: username.value });
        router.push('/admin');
      } else {
        errorMessage.value = 'Kullanıcı adı veya parola hatalı!';
      }
    };

    const closeModal = () => {
      showAdminModal.value = false;
      username.value = '';
      password.value = '';
      errorMessage.value = '';
    };

    return {
      username,
      password,
      showAdminModal,
      errorMessage,
      handleAdminLogin,
      handleUserLogin,
      submitAdminLogin,
      closeModal
    };
  }
};
</script>

<style scoped>
/* Genel Sayfa Stili */
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f4f4;
  font-family: 'Arial', sans-serif;
}

/* Başlık ve Slogan */
.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
}

.header p {
  font-size: 18px;
  color: #6c757d;
  margin: 0;
}

/* Seçim Kutusu */
.selection-container {
  display: flex;
  gap: 50px;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.option:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}

.option .icon {
  font-size: 48px;
  color: #007bff;
  margin-bottom: 10px;
}

.option p {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* Modal Stili */
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
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 300px;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 20px;
}

.modal-content input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background-color: #007bff;
  color: white;
}

.modal-actions button[type="button"] {
  background-color: #6c757d;
  color: white;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 10px;
}
</style>
