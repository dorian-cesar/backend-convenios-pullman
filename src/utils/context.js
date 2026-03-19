const { AsyncLocalStorage } = require('async_hooks');

const context = new AsyncLocalStorage();

/**
 * Obtiene el ID del usuario del contexto actual de la petición.
 */
const getUserId = () => {
  const store = context.getStore();
  return store ? store.userId : null;
};

/**
 * Establece el ID del usuario en el contexto actual.
 */
const setUserId = (userId) => {
  const store = context.getStore();
  if (store) {
    store.userId = userId;
  }
};

module.exports = {
  context,
  getUserId,
  setUserId
};
