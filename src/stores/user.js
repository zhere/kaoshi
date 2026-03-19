import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const loginType = ref('')
  const token = ref('')

  const isLoggedIn = computed(() => !!user.value)

  const setUser = (userData) => {
    user.value = userData
    token.value = 'mock_token_' + Date.now()
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token.value)
  }

  const setLoginType = (type) => {
    loginType.value = type
    localStorage.setItem('loginType', type)
  }

  const logout = () => {
    user.value = null
    loginType.value = ''
    token.value = ''
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('loginType')
  }

  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    const savedLoginType = localStorage.getItem('loginType')
    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser)
      token.value = savedToken
      loginType.value = savedLoginType || ''
    }
  }

  return {
    user,
    loginType,
    token,
    isLoggedIn,
    setUser,
    setLoginType,
    logout,
    initUser
  }
})
