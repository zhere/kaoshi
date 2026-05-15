<template>
  <div class="pc-exam-page">
    <div class="pc-exam-header">
      <div class="header-left">
        <h3>国网后勤考试系统</h3>
      </div>
      <div class="header-right">
        <span v-if="pcUser" class="user-info">{{ pcUser.name }} ({{ pcUser.department }})</span>
        <el-button v-if="pcUser" type="danger" size="small" @click="handleLogout">退出</el-button>
      </div>
    </div>

    <div class="pc-exam-content">
      <!-- 手机号登录页面 -->
      <div v-if="pageState === 'login'" class="login-page">
        <div class="login-card">
          <h2 class="login-title">欢迎参加考试</h2>
          <p class="login-desc">请先登录后参加考试</p>
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="0">
            <el-form-item prop="phone">
              <el-input v-model="loginForm.phone" placeholder="请输入手机号" prefix-icon="Iphone" size="large" maxlength="11" />
            </el-form-item>
            <el-form-item prop="smsCode">
              <div style="display: flex; gap: 10px; width: 100%;">
                <el-input v-model="loginForm.smsCode" placeholder="请输入短信验证码" prefix-icon="Key" size="large" style="flex: 1;" maxlength="6" @keyup.enter="handleLogin" />
                <el-button type="primary" size="large" @click="handleSendSms" :disabled="!!smsTimer">
                  {{ smsTimer ? smsTimer + 's' : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loginLoading">登 录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 考试信息页 -->
      <div v-if="pageState === 'info'" class="exam-info-page">
        <div class="info-card">
          <h1 class="exam-name">{{ examInfo?.name }}</h1>
          <el-tag :type="examInfo?.status === 'ongoing' ? 'success' : 'warning'" size="medium">
            {{ examInfo?.status === 'ongoing' ? '进行中' : '未开始' }}
          </el-tag>
          <el-divider />
          <el-descriptions :column="2" border>
            <el-descriptions-item label="考试时长">{{ examInfo?.duration }} 分钟</el-descriptions-item>
            <el-descriptions-item label="题目数量">{{ getExamQuestionCount(examInfo) }} 道</el-descriptions-item>
            <el-descriptions-item label="试卷总分">{{ getExamTotalScore(examInfo) }} 分</el-descriptions-item>
            <el-descriptions-item label="及格分数">{{ examInfo?.passScore }} 分</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ examInfo?.startTime }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ examInfo?.endTime }}</el-descriptions-item>
          </el-descriptions>
          <div style="margin-top: 30px; text-align: center;">
            <el-button v-if="examInfo?.status === 'ongoing'" type="primary" size="large" style="width: 200px;" @click="startExam">
              开始答题
            </el-button>
            <el-button v-else type="info" size="large" disabled>考试未开始</el-button>
          </div>
        </div>
      </div>

      <!-- 答题页面 -->
      <div v-if="pageState === 'taking'" class="exam-taking-page">
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

      <!-- 考试结果页 -->
      <div v-if="pageState === 'result'" class="exam-result-page">
        <div class="result-card">
          <div class="score-circle" :class="examResult.isPass ? 'pass' : 'fail'">
            <div class="score-number">{{ examResult.score }}</div>
            <div class="score-text">分</div>
          </div>
          <h2 style="margin: 20px 0 10px;">{{ examResult.isPass ? '恭喜通过！' : '未能通过' }}</h2>
          <p style="color: #666;">{{ examResult.examName }}</p>
          <div style="margin-top: 20px; display: flex; justify-content: center; gap: 40px;">
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #67C23A;">{{ examResult.correctCount }}</div>
              <div style="color: #666; font-size: 14px;">正确</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #F56C6C;">{{ examResult.wrongCount }}</div>
              <div style="color: #666; font-size: 14px;">错误</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #409EFF;">{{ examResult.totalQuestions }}</div>
              <div style="color: #666; font-size: 14px;">总题数</div>
            </div>
          </div>

          <el-alert
            title="其他信息请前往小程序查看"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 30px;"
          >
            <template #default>
              <p>学习资料、我的积分、历史记录等功能请在微信小程序中查看。</p>
            </template>
          </el-alert>

          <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center;">
            <el-button type="primary" @click="viewAnswerDetail">查看答题详情</el-button>
            <el-button @click="goBackToInfo">返回考试信息</el-button>
          </div>
        </div>

        <div v-if="showDetail" class="detail-card" style="margin-top: 20px;">
          <div class="page-title">答题详情</div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="全部题目" name="all"></el-tab-pane>
            <el-tab-pane :label="`正确 (${examResult.correctCount})`" name="correct"></el-tab-pane>
            <el-tab-pane :label="`错误 (${examResult.wrongCount})`" name="wrong"></el-tab-pane>
          </el-tabs>
          <div v-for="(question, index) in filteredQuestions" :key="question.id" class="question-item" style="margin-bottom: 20px;">
            <div class="question-title">
              <span style="color: #409EFF; font-weight: bold;">第 {{ index + 1 }} 题</span>
              <el-tag size="small" style="margin-left: 10px;">{{ question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '判断题' }}</el-tag>
              <el-tag v-if="isCorrectAnswer(question.id)" size="small" type="success" style="margin-left: 5px;">正确</el-tag>
              <el-tag v-else size="small" type="danger" style="margin-left: 5px;">错误</el-tag>
              <span style="margin-left: 10px;">{{ question.content }}</span>
            </div>
            <div class="question-options">
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="question-option" :class="getOptionClass(question, optionLabels[optIndex])">
                <span style="margin-right: 10px;">{{ optionLabels[optIndex] }}.</span>
                <span>{{ option }}</span>
                <el-icon v-if="isCorrectOpt(question, optionLabels[optIndex])" style="margin-left: auto; color: #67C23A;"><CircleCheck /></el-icon>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { exams as mockExams, questions as mockQuestions, users as mockUsers } from '../../data/mockData'
import { useExamStore } from '@/stores/exam'

const route = useRoute()
const examStore = useExamStore()

const pcUser = ref(null)
const pageState = ref('login')
const examInfo = ref(null)
const examQuestions = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const markedQuestions = ref([])
const remainingTime = ref(0)
const submitDialogVisible = ref(false)
const timer = ref(null)
const examResult = ref({})
const showDetail = ref(false)
const activeTab = ref('all')

const loginFormRef = ref(null)
const loginLoading = ref(false)
const smsTimer = ref(0)
const loginForm = reactive({ phone: '', smsCode: '' })

const phoneValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1\d{10}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const loginRules = {
  phone: [{ required: true, validator: phoneValidator, trigger: 'blur' }],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

const currentQuestion = computed(() => examQuestions.value[currentIndex.value])

const answeredCount = computed(() => {
  return Object.keys(userAnswers.value).filter(key => {
    const answer = userAnswers.value[key]
    return answer && (Array.isArray(answer) ? answer.length > 0 : true)
  }).length
})

const unansweredCount = computed(() => examQuestions.value.length - answeredCount.value)

const filteredQuestions = computed(() => {
  const questions = examResult.value.questions || []
  if (activeTab.value === 'correct') {
    return questions.filter(q => isCorrectAnswer(q.id))
  } else if (activeTab.value === 'wrong') {
    return questions.filter(q => !isCorrectAnswer(q.id))
  }
  return questions
})

const getExamQuestionCount = (exam) => {
  if (exam?.questionConfig && Array.isArray(exam.questionConfig)) {
    return exam.questionConfig.reduce((sum, item) => sum + (item.count || 0), 0)
  }
  return exam?.questionCount || 0
}

const getExamTotalScore = (exam) => {
  if (exam?.questionConfig && Array.isArray(exam.questionConfig)) {
    return exam.questionConfig.reduce((sum, item) => sum + (item.count || 0) * (item.scorePerQuestion || 0), 0)
  }
  return exam?.totalScore || 0
}

const handleSendSms = () => {
  if (!/^1\d{10}$/.test(loginForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (smsTimer.value > 0) return
  ElMessage.success('验证码已发送，默认验证码为 1234')
  smsTimer.value = 60
  const sendSmsTimer = setInterval(() => {
    smsTimer.value--
    if (smsTimer.value <= 0) {
      clearInterval(sendSmsTimer)
    }
  }, 1000)
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loginLoading.value = true
      setTimeout(() => {
        if (loginForm.smsCode !== '1234') {
          ElMessage.error('验证码错误')
          loginLoading.value = false
          return
        }
        const user = mockUsers.find(u => u.phone === loginForm.phone && u.role === 'employee')
        if (user) {
          pcUser.value = user
          ElMessage.success('登录成功')
          pageState.value = 'info'
        } else {
          ElMessage.error('该手机号未注册')
        }
        loginLoading.value = false
      }, 500)
    }
  })
}

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

const startExam = () => {
  ElMessageBox.confirm('确定要开始答题吗？开始后将计时，请确保有足够时间完成。', '提示', {
    confirmButtonText: '开始答题',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    pageState.value = 'taking'
    remainingTime.value = examInfo.value.duration * 60
    timer.value = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        clearInterval(timer.value)
        ElMessage.warning('考试时间已到，自动提交')
        submitExam()
      }
    }, 1000)
  }).catch(() => {})
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
  examResult.value = {
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
  }
  examStore.setExamResult(examResult.value)
  submitDialogVisible.value = false
  pageState.value = 'result'
}

const viewAnswerDetail = () => {
  showDetail.value = !showDetail.value
}

const isCorrectAnswer = (questionId) => {
  const question = examResult.value.questions?.find(q => q.id === questionId)
  if (!question) return false
  const userAnswer = examResult.value.answers?.[questionId]
  if (!userAnswer) return false
  const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
  return userAnswerStr === question.answer
}

const isCorrectOpt = (question, option) => {
  return question.answer.includes(option)
}

const getOptionClass = (question, option) => {
  const userAnswer = examResult.value.answers?.[question.id]
  if (!userAnswer) return ''
  const isSelected = Array.isArray(userAnswer) ? userAnswer.includes(option) : userAnswer === option
  const isCorrectOptVal = question.answer.includes(option)
  if (isSelected && isCorrectOptVal) return 'correct'
  if (isSelected && !isCorrectOptVal) return 'wrong'
  if (!isSelected && isCorrectOptVal) return 'correct'
  return ''
}

const goBackToInfo = () => {
  pageState.value = 'info'
  showDetail.value = false
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    pcUser.value = null
    pageState.value = 'login'
    loginForm.phone = ''
    loginForm.smsCode = ''
  }).catch(() => {})
}

onMounted(() => {
  const examId = parseInt(route.params.id)
  const exam = mockExams.find(e => e.id === examId)
  if (exam) {
    examInfo.value = exam
    examQuestions.value = mockQuestions.filter(q => exam.questions?.includes(q.id))
    if (!examQuestions.value.length) {
      examQuestions.value = mockQuestions.slice(0, exam.questionCount || 5)
    }
  } else {
    ElMessage.error('考试不存在')
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.pc-exam-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.pc-exam-header {
  background: white;
  padding: 12px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left h3 {
  margin: 0;
  color: #009944;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: #333;
  font-size: 14px;
}

.pc-exam-content {
  max-width: 900px;
  margin: 30px auto;
  padding: 0 20px;
}

.login-page {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 50px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 420px;
}

.login-title {
  text-align: center;
  color: #303133;
  font-size: 24px;
  margin-bottom: 10px;
}

.login-desc {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-bottom: 30px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.exam-name {
  font-size: 28px;
  color: #303133;
  margin-bottom: 15px;
  text-align: center;
}

.exam-timer {
  position: fixed;
  top: 70px;
  right: 40px;
  background: white;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.timer-text {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
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

.question-option:hover {
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

.result-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}
</style>