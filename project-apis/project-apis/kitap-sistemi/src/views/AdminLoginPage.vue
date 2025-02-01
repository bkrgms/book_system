<template>
  <div class="admin-login-page">
    <h1 class="title">Yönetici Girişi</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Kullanıcı Adı</label>
        <input
          v-model="username"
          id="username"
          type="text"
          placeholder="Kullanıcı Adınızı Girin"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Parola</label>
        <input
          v-model="password"
          id="password"
          type="password"
          placeholder="Parolanızı Girin"
          required
        />
      </div>
      <div class="form-actions">
        <button @click="goBack" type="button" class="back-button">Geri</button>
        <button type="submit" class="login-button">Giriş Yap</button>
      </div>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    handleLogin() {
      // Yönetici giriş bilgileri
      const adminCredentials = {
        username: "admin",
        password: "admin"
      };

      if (
        this.username === adminCredentials.username &&
        this.password === adminCredentials.password
      ) {
        this.$router.push("/admin");
      } else {
        this.errorMessage = "Kullanıcı adı veya parola hatalı!";
      }
    },
    goBack() {
      this.$router.push("/"); // Giriş sayfasına yönlendirme
    },
  },
};
</script>

<style>
.admin-login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
}

.title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
}

input {
  width: 300px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  width: 320px;
}

.back-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #5a6268;
}

.login-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #218838;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
</style>
