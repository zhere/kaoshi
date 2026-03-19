import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExamStore = defineStore('exam', () => {
  const examResult = ref(null)

  const setExamResult = (result) => {
    examResult.value = result
  }

  const clearExamResult = () => {
    examResult.value = null
  }

  return {
    examResult,
    setExamResult,
    clearExamResult
  }
})
