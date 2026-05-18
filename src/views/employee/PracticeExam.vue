<template>
  <div>
    <div v-if="!isStarted" class="page-card">
      <div class="page-title">在线练习</div>
      <div style="padding: 20px;">
        <el-form :model="practiceForm" label-width="100px">
          <el-form-item label="选择练习分类">
            <el-select v-model="practiceForm.category" placeholder="请选择题目分类" style="width: 100%">
              <el-option v-for="cat in categories" :key="cat.id" :label="`${cat.name} (${getCategoryQuestionCount(cat.id)}题)`" :value="cat.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="startPractice" :disabled="!practiceForm.category">
              <el-icon><Play /></el-icon>开始练习
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="practiceForm.category" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
          <p style="color: #666; font-size: 14px;">
            <el-icon><InfoFilled /></el-icon>
            本次练习将包含 <strong style="color: #409EFF;">{{ getCategoryQuestionCount(practiceForm.category) }}</strong> 道题目
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">
            <el-icon><Clock /></el-icon>
            练习无时间限制，答题后可即时查看答案解析
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="!isFinished" class="page-card">
      <div class="practice-header">
        <div class="practice-title">{{ currentCategoryName }}</div>
        <div class="practice-progress">
          <span>第 {{ currentIndex + 1 }} / {{ practiceQuestions.length }} 题</span>
          <span style="margin-left: 20px; color: #67C23A;">正确: {{ correctCount }}</span>
          <span style="margin-left: 10px; color: #F56C6C;">错误: {{ wrongCount }}</span>
        </div>
      </div>

      <div class="question-nav" style="margin-bottom: 20px;">
        <span style="margin-right: 10px;">题目导航：</span>
        <el-button v-for="(q, index) in practiceQuestions" :key="q.id" :type="getNavButtonType(index)" size="small" style="margin: 2px;" @click="goToQuestion(index)">
          {{ index + 1 }}
        </el-button>
      </div>

      <div v-if="currentQuestion" class="question-item">
        <div class="question-title">
          <span style="color: #409EFF; font-weight: bold;">第 {{ currentIndex + 1 }} 题</span>
          <el-tag size="small" style="margin-left: 10px;">{{ currentQuestion.type === 'single' ? '单选题' : currentQuestion.type === 'multiple' ? '多选题' : '判断题' }}</el-tag>
          <span style="margin-left: 10px;">{{ currentQuestion.content }}</span>
        </div>
        <div class="question-options">
          <div v-for="(option, index) in currentQuestion.options" :key="index" class="question-option" :class="getOptionClass(currentQuestion, optionLabels[index])" @click="selectOption(currentQuestion.id, optionLabels[index], currentQuestion.type)">
            <span style="margin-right: 10px;">{{ optionLabels[index] }}.</span>
            <span>{{ option }}</span>
            <el-icon v-if="showFeedback && isCorrectOption(currentQuestion, optionLabels[index])" style="margin-left: auto; color: #67C23A;"><CircleCheck /></el-icon>
            <el-icon v-if="showFeedback && isWrongSelected(currentQuestion, optionLabels[index])" style="margin-left: auto; color: #F56C6C;"><Close /></el-icon>
          </div>
        </div>
        <div v-if="showFeedback" style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
          <div style="margin-bottom: 10px;">
            <span style="color: #67C23A; font-weight: bold;">正确答案：</span>
            <span>{{ currentQuestion.answer }}</span>
          </div>
          <div>
            <span style="color: #409EFF; font-weight: bold;">答案解析：</span>
            <span style="color: #666;">{{ currentQuestion.analysis }}</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <el-button @click="prevQuestion" :disabled="currentIndex === 0">上一题</el-button>
        <div style="color: #666;">
          {{ currentIndex + 1 }} / {{ practiceQuestions.length }}
        </div>
        <el-button v-if="currentIndex < practiceQuestions.length - 1" @click="nextQuestion">下一题</el-button>
        <el-button v-else type="primary" @click="finishPractice">完成练习</el-button>
      </div>
    </div>

    <div v-else class="page-card">
      <div class="result-score">
        <div class="score-circle" :class="score >= 60 ? 'pass' : 'fail'">
          <div class="score-number">{{ score }}</div>
          <div class="score-text">分</div>
        </div>
        <h2 style="margin: 20px 0 10px;">练习完成！</h2>
        <p style="color: #666;">{{ currentCategoryName }}</p>
        <div style="margin-top: 20px; display: flex; justify-content: center; gap: 40px;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #67C23A;">{{ correctCount }}</div>
            <div style="color: #666; font-size: 14px;">正确</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #F56C6C;">{{ wrongCount }}</div>
            <div style="color: #666; font-size: 14px;">错误</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #409EFF;">{{ practiceQuestions.length }}</div>
            <div style="color: #666; font-size: 14px;">总题数</div>
          </div>
        </div>
        <div style="margin-top: 30px;">
          <el-button type="primary" @click="resetPractice">重新练习</el-button>
          <el-button @click="goBack">返回首页</el-button>
        </div>
      </div>

      <div class="page-card" style="margin-top: 20px;">
        <div class="page-title">答题详情</div>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="全部题目" name="all"></el-tab-pane>
          <el-tab-pane :label="`正确 (${correctCount})`" name="correct"></el-tab-pane>
          <el-tab-pane :label="`错误 (${wrongCount})`" name="wrong"></el-tab-pane>
        </el-tabs>
        <div v-for="(question, index) in filteredQuestions" :key="question.id" class="question-item" style="margin-bottom: 20px;">
          <div class="question-title">
            <span style="color: #409EFF; font-weight: bold;">第 {{ getOriginalIndex(question.id) + 1 }} 题</span>
            <el-tag size="small" style="margin-left: 10px;">{{ question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '判断题' }}</el-tag>
            <el-tag v-if="isQuestionCorrect(question.id)" size="small" type="success" style="margin-left: 5px;">正确</el-tag>
            <el-tag v-else size="small" type="danger" style="margin-left: 5px;">错误</el-tag>
            <span style="margin-left: 10px;">{{ question.content }}</span>
          </div>
          <div class="question-options">
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="question-option" :class="getResultOptionClass(question, optionLabels[optIndex])">
              <span style="margin-right: 10px;">{{ optionLabels[optIndex] }}.</span>
              <span>{{ option }}</span>
            </div>
          </div>
          <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
            <div style="margin-bottom: 10px;">
              <span style="color: #67C23A; font-weight: bold;">正确答案：</span>
              <span>{{ question.answer }}</span>
            </div>
            <div>
              <span style="color: #409EFF; font-weight: bold;">答案解析：</span>
              <span style="color: #666;">{{ question.analysis }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { questions as mockQuestions, categories as mockCategories } from '@/data/mockData'

const router = useRouter()

const isStarted = ref(false)
const isFinished = ref(false)
const activeTab = ref('all')

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

const practiceForm = reactive({
  category: ''
})

const practiceQuestions = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const showFeedback = ref(false)
const correctCount = ref(0)
const wrongCount = ref(0)
const answeredQuestions = ref(new Set())

const categories = computed(() => mockCategories)

const currentQuestion = computed(() => practiceQuestions.value[currentIndex.value])

const currentCategoryName = computed(() => {
  const cat = categories.value.find(c => c.id === practiceForm.category)
  return cat ? cat.name : ''
})

const score = computed(() => {
  if (practiceQuestions.value.length === 0) return 0
  return Math.round((correctCount.value / practiceQuestions.value.length) * 100)
})

const filteredQuestions = computed(() => {
  const questions = practiceQuestions.value
  if (activeTab.value === 'correct') {
    return questions.filter(q => isQuestionCorrect(q.id))
  } else if (activeTab.value === 'wrong') {
    return questions.filter(q => !isQuestionCorrect(q.id))
  }
  return questions
})

const getCategoryQuestionCount = (categoryId) => {
  return mockQuestions.filter(q => q.category === categoryId).length
}

const getNavButtonType = (index) => {
  const question = practiceQuestions.value[index]
  if (!question) return ''
  const isAnswered = answeredQuestions.value.has(question.id)
  const isCorrect = isQuestionCorrect(question.id)
  if (index === currentIndex.value) return 'primary'
  if (!isAnswered) return ''
  return isCorrect ? 'success' : 'danger'
}

const isOptionSelected = (questionId, option) => {
  const answer = userAnswers.value[questionId]
  if (!answer) return false
  if (Array.isArray(answer)) {
    return answer.includes(option)
  }
  return answer === option
}

const isCorrectOption = (question, option) => {
  return question.answer.includes(option)
}

const isWrongSelected = (question, option) => {
  if (!showFeedback.value) return false
  const isSelected = isOptionSelected(question.id, option)
  const isCorrect = isCorrectOption(question, option)
  return isSelected && !isCorrect
}

const getOptionClass = (question, option) => {
  if (!showFeedback.value) {
    return isOptionSelected(question.id, option) ? 'selected' : ''
  }
  const isSelected = isOptionSelected(question.id, option)
  const isCorrect = isCorrectOption(question, option)
  if (isSelected && isCorrect) return 'correct selected'
  if (isSelected && !isCorrect) return 'wrong selected'
  if (!isSelected && isCorrect) return 'correct'
  return ''
}

const getResultOptionClass = (question, option) => {
  const isSelected = isOptionSelected(question.id, option)
  const isCorrect = isCorrectOption(question, option)
  if (isSelected && isCorrect) return 'correct'
  if (isSelected && !isCorrect) return 'wrong'
  if (!isSelected && isCorrect) return 'correct'
  return ''
}

const isQuestionCorrect = (questionId) => {
  const question = practiceQuestions.value.find(q => q.id === questionId)
  if (!question) return false
  const userAnswer = userAnswers.value[questionId]
  if (!userAnswer) return false
  const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
  return userAnswerStr === question.answer
}

const getOriginalIndex = (questionId) => {
  return practiceQuestions.value.findIndex(q => q.id === questionId)
}

const selectOption = (questionId, option, type) => {
  if (showFeedback.value) return

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
    showFeedback.value = true
    answeredQuestions.value.add(questionId)
    checkAnswer(questionId)
  }
}

const checkAnswer = (questionId) => {
  const question = practiceQuestions.value.find(q => q.id === questionId)
  if (!question) return
  const userAnswer = userAnswers.value[questionId]
  const correctAnswer = question.answer
  const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
  if (userAnswerStr === correctAnswer) {
    correctCount.value++
  } else {
    wrongCount.value++
  }
}

const goToQuestion = (index) => {
  currentIndex.value = index
  const question = practiceQuestions.value[index]
  showFeedback.value = answeredQuestions.value.has(question.id)
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    const question = practiceQuestions.value[currentIndex.value]
    showFeedback.value = answeredQuestions.value.has(question.id)
  }
}

const nextQuestion = () => {
  if (currentIndex.value < practiceQuestions.value.length - 1) {
    currentIndex.value++
    const question = practiceQuestions.value[currentIndex.value]
    showFeedback.value = answeredQuestions.value.has(question.id)
  }
}

const startPractice = () => {
  const categoryQuestions = mockQuestions.filter(q => q.category === practiceForm.category)
  practiceQuestions.value = [...categoryQuestions].sort(() => Math.random() - 0.5)
  currentIndex.value = 0
  userAnswers.value = {}
  showFeedback.value = false
  correctCount.value = 0
  wrongCount.value = 0
  answeredQuestions.value = new Set()
  isStarted.value = true
  isFinished.value = false
}

const finishPractice = () => {
  isFinished.value = true
  savePracticeRecord()
}

const savePracticeRecord = () => {
  const record = {
    id: Date.now(),
    userId: 4,
    category: practiceForm.category,
    questions: [...practiceQuestions.value],
    userAnswers: { ...userAnswers.value },
    correctCount: correctCount.value,
    wrongCount: wrongCount.value,
    duration: 0,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    type: 'practice'
  }
  
  if (!window.practiceRecords) {
    window.practiceRecords = []
  }
  window.practiceRecords.push(record)
  
  ElMessage.success('练习记录已保存')
}

const resetPractice = () => {
  isStarted.value = false
  isFinished.value = false
  practiceForm.category = ''
}

const goBack = () => {
  router.push('/employee/exam-list')
}
</script>

<style scoped>
.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.practice-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.practice-progress {
  font-size: 14px;
  color: #666;
}

.question-nav {
  margin-bottom: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.question-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.question-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.6;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-option {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
}

.question-option:hover:not(.correct):not(.wrong) {
  background: #f0f7ff;
  border-color: #409eff;
}

.question-option.selected {
  background: #ecf5ff;
  border-color: #409eff;
}

.question-option.correct {
  background: #f0f9eb;
  border-color: #67c23a;
}

.question-option.wrong {
  background: #fef0f0;
  border-color: #f56c6c;
}

.result-score {
  text-align: center;
  padding: 40px 20px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  color: white;
}

.score-circle.pass {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.score-circle.fail {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.score-number {
  font-size: 48px;
  font-weight: bold;
}

.score-text {
  font-size: 16px;
}

@media (max-width: 768px) {
  .practice-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .practice-title {
    font-size: 16px;
  }
  
  .question-item {
    padding: 15px;
  }
  
  .question-title {
    font-size: 14px;
  }
  
  .question-option {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .result-score {
    padding: 30px 15px;
  }
  
  .score-circle {
    width: 120px;
    height: 120px;
  }
  
  .score-number {
    font-size: 36px;
  }
}
</style>