<template>
  <div>
    <div class="page-card">
      <div class="result-score">
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
        <div style="margin-top: 30px;">
          <el-button type="primary" @click="router.push('/employee/exam-list')">返回考试列表</el-button>
          <el-button @click="retryExam">重新答题</el-button>
        </div>
      </div>
    </div>

    <div class="page-card" style="margin-top: 20px;">
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
          <el-tag v-if="isCorrect(question.id)" size="small" type="success" style="margin-left: 5px;">正确</el-tag>
          <el-tag v-else size="small" type="danger" style="margin-left: 5px;">错误</el-tag>
          <span style="margin-left: 10px;">{{ question.content }}</span>
        </div>
        <div class="question-options">
          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="question-option" :class="getOptionClass(question, optionLabels[optIndex])">
            <span style="margin-right: 10px;">{{ optionLabels[optIndex] }}.</span>
            <span>{{ option }}</span>
            <el-icon v-if="isCorrectOption(question, optionLabels[optIndex])" style="margin-left: auto; color: #67C23A;"><CircleCheck /></el-icon>
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useExamStore } from '@/stores/exam'

const router = useRouter()
const examStore = useExamStore()
const examResult = computed(() => examStore.examResult || {})
const activeTab = ref('all')

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

const filteredQuestions = computed(() => {
  const questions = examResult.value.questions || []
  if (activeTab.value === 'correct') {
    return questions.filter(q => isCorrect(q.id))
  } else if (activeTab.value === 'wrong') {
    return questions.filter(q => !isCorrect(q.id))
  }
  return questions
})

const isCorrect = (questionId) => {
  const question = examResult.value.questions?.find(q => q.id === questionId)
  if (!question) return false
  const userAnswer = examResult.value.answers?.[questionId]
  if (!userAnswer) return false
  const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
  return userAnswerStr === question.answer
}

const isCorrectOption = (question, option) => {
  return question.answer.includes(option)
}

const getOptionClass = (question, option) => {
  const userAnswer = examResult.value.answers?.[question.id]
  if (!userAnswer) return ''
  const isSelected = Array.isArray(userAnswer) ? userAnswer.includes(option) : userAnswer === option
  const isCorrectOpt = question.answer.includes(option)
  if (isSelected && isCorrectOpt) return 'correct'
  if (isSelected && !isCorrectOpt) return 'wrong'
  if (!isSelected && isCorrectOpt) return 'correct'
  return ''
}

const retryExam = () => {
  ElMessageBox.confirm('确定要重新答题吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    router.push(`/employee/exam/${examResult.value.examId}`)
  }).catch(() => {})
}
</script>
