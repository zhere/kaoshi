<template>
  <div>
    <div v-if="examInfo" class="page-card">
      <div class="page-title">{{ examInfo.name }}</div>
      <div class="exam-timer">
        <div style="color: #666; font-size: 14px; margin-bottom: 5px;">剩余时间</div>
        <div class="timer-text">{{ formatTime(remainingTime) }}</div>
      </div>
      
      <div class="question-nav" style="margin-bottom: 20px;">
        <span style="margin-right: 10px;">题目导航：</span>
        <el-button v-for="(q, index) in examQuestions" :key="q.id" :type="getNavButtonType(q.id)" size="small" style="margin: 2px;" @click="goToQuestion(index)">
          {{ index + 1 }}
        </el-button>
      </div>

      <div v-if="currentQuestion" class="question-item">
        <div class="question-title">
          <span style="color: #409EFF; font-weight: bold;">第 {{ currentIndex + 1 }} 题</span>
          <el-tag size="small" style="margin-left: 10px;">{{ currentQuestion.type === 'single' ? '单选题' : currentQuestion.type === 'multiple' ? '多选题' : '判断题' }}</el-tag>
          <el-tag size="small" type="warning" style="margin-left: 5px;">{{ currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难' }}</el-tag>
          <span style="margin-left: 10px;">{{ currentQuestion.content }}</span>
        </div>
        <div class="question-options">
          <div v-for="(option, index) in currentQuestion.options" :key="index" class="question-option" :class="{ selected: isOptionSelected(currentQuestion.id, optionLabels[index]) }" @click="selectOption(currentQuestion.id, optionLabels[index], currentQuestion.type)">
            <span style="margin-right: 10px;">{{ optionLabels[index] }}.</span>
            <span>{{ option }}</span>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <el-button type="warning" size="small" @click="toggleMark(currentQuestion.id)">
            <el-icon><Star /></el-icon>{{ isMarked(currentQuestion.id) ? '取消标记' : '标记题目' }}
          </el-button>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <el-button @click="prevQuestion" :disabled="currentIndex === 0">上一题</el-button>
        <div style="color: #666;">
          {{ currentIndex + 1 }} / {{ examQuestions.length }}
        </div>
        <el-button @click="nextQuestion" :disabled="currentIndex === examQuestions.length - 1">下一题</el-button>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <el-button type="primary" size="large" @click="showSubmitDialog" style="width: 200px;">提交答案</el-button>
      </div>
    </div>

    <el-dialog v-model="submitDialogVisible" title="提交确认" width="500px">
      <div style="text-align: center;">
        <p style="font-size: 16px; margin-bottom: 20px;">您已完成 <strong>{{ answeredCount }}</strong> / {{ examQuestions.length }} 题</p>
        <div v-if="unansweredCount > 0" style="color: #E6A23C; margin-bottom: 15px;">
          <el-icon><Warning /></el-icon>
          还有 {{ unansweredCount }} 道题目未作答
        </div>
        <div v-if="markedQuestions.length > 0" style="color: #409EFF; margin-bottom: 15px;">
          <el-icon><Star /></el-icon>
          已标记 {{ markedQuestions.length }} 道题目
        </div>
        <p style="color: #666;">确定要提交答案吗？提交后不可修改。</p>
      </div>
      <template #footer>
        <el-button @click="submitDialogVisible = false">继续答题</el-button>
        <el-button type="primary" @click="submitExam">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { exams as mockExams, questions as mockQuestions } from '@/data/mockData'
import { useExamStore } from '@/stores/exam'

const router = useRouter()
const route = useRoute()
const examStore = useExamStore()

const examInfo = ref(null)
const examQuestions = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const markedQuestions = ref([])
const remainingTime = ref(0)
const submitDialogVisible = ref(false)
const timer = ref(null)

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

const currentQuestion = computed(() => examQuestions.value[currentIndex.value])

const answeredCount = computed(() => {
  return Object.keys(userAnswers.value).filter(key => {
    const answer = userAnswers.value[key]
    return answer && (Array.isArray(answer) ? answer.length > 0 : true)
  }).length
})

const unansweredCount = computed(() => examQuestions.value.length - answeredCount.value)

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const getNavButtonType = (questionId) => {
  if (markedQuestions.value.includes(questionId)) return 'warning'
  if (userAnswers.value[questionId]) return 'success'
  return ''
}

const isOptionSelected = (questionId, option) => {
  const answer = userAnswers.value[questionId]
  if (!answer) return false
  if (Array.isArray(answer)) {
    return answer.includes(option)
  }
  return answer === option
}

const selectOption = (questionId, option, type) => {
  if (type === 'multiple') {
    if (!userAnswers.value[questionId]) {
      userAnswers.value[questionId] = []
    }
    const index = userAnswers.value[questionId].indexOf(option)
    if (index === -1) {
      userAnswers.value[questionId].push(option)
    } else {
      userAnswers.value[questionId].splice(index, 1)
    }
  } else {
    userAnswers.value[questionId] = option
  }
}

const toggleMark = (questionId) => {
  const index = markedQuestions.value.indexOf(questionId)
  if (index === -1) {
    markedQuestions.value.push(questionId)
    ElMessage.success('已标记该题目')
  } else {
    markedQuestions.value.splice(index, 1)
    ElMessage.info('已取消标记')
  }
}

const isMarked = (questionId) => markedQuestions.value.includes(questionId)

const goToQuestion = (index) => {
  currentIndex.value = index
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextQuestion = () => {
  if (currentIndex.value < examQuestions.value.length - 1) {
    currentIndex.value++
  }
}

const showSubmitDialog = () => {
  submitDialogVisible.value = true
}

const submitExam = () => {
  clearInterval(timer.value)
  let correctCount = 0
  examQuestions.value.forEach(q => {
    const userAnswer = userAnswers.value[q.id]
    const correctAnswer = q.answer
    if (userAnswer) {
      const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
      if (userAnswerStr === correctAnswer) {
        correctCount++
      }
    }
  })
  const score = Math.round((correctCount / examQuestions.value.length) * 100)
  const isPass = score >= examInfo.value.passScore
  examStore.setExamResult({
    examId: examInfo.value.id,
    examName: examInfo.value.name,
    score,
    isPass,
    correctCount,
    wrongCount: examQuestions.value.length - correctCount,
    totalQuestions: examQuestions.value.length,
    answers: { ...userAnswers.value },
    questions: [...examQuestions.value],
    submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  })
  ElMessage.success('提交成功')
  router.push('/employee/result')
}

onMounted(() => {
  const examId = parseInt(route.params.id)
  const exam = mockExams.find(e => e.id === examId)
  if (exam) {
    examInfo.value = exam
    examQuestions.value = mockQuestions.filter(q => exam.questions.includes(q.id))
    remainingTime.value = exam.duration * 60
    timer.value = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        clearInterval(timer.value)
        ElMessage.warning('考试时间已到，自动提交')
        submitExam()
      }
    }, 1000)
  } else {
    ElMessage.error('考试不存在')
    router.push('/employee/exam-list')
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>
