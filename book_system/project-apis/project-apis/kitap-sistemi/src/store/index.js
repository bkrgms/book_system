import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      books: [],
      currentUser: null,
      isAuthenticated: false
    }
  },
  mutations: {
    SET_BOOKS(state, books) {
      state.books = books;
    },
    ADD_BOOK(state, book) {
      state.books.push(book);
    },
    UPDATE_BOOK(state, updatedBook) {
      const index = state.books.findIndex(book => book.id === updatedBook.id);
      if (index !== -1) {
        state.books[index] = updatedBook;
      }
    },
    DELETE_BOOK(state, bookId) {
      state.books = state.books.filter(book => book.id !== bookId);
    },
    SET_USER(state, user) {
      state.currentUser = user;
      state.isAuthenticated = !!user;
    }
  },
  actions: {
    setBooks({ commit }, books) {
      commit('SET_BOOKS', books);
    },
    addBook({ commit }, book) {
      commit('ADD_BOOK', book);
    },
    updateBook({ commit }, book) {
      commit('UPDATE_BOOK', book);
    },
    deleteBook({ commit }, bookId) {
      commit('DELETE_BOOK', bookId);
    },
    login({ commit }, user) {
      commit('SET_USER', user);
    },
    logout({ commit }) {
      commit('SET_USER', null);
    }
  },
  getters: {
    allBooks: state => state.books,
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.currentUser
  }
});

export default store; 