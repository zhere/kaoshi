<template>
  <div>
    <div class="page-card">
      <div class="page-title">历史答题记录</div>
      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 300px;" />
        <el-select v-model="filterResult" placeholder="考试结果" clearable style="width: 120px;">
          <el-option label="通过" value="pass" />
          <el-option label="未通过" value="fail" />
        </el-select>
      </div>
      <el-table :data="filteredRecords" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="examName" label="考试名称" />
        <el-table-column prop="score" label="得分" width="80">
          <template #default="{ row }">
            <span :style="{ color: row.isPass ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isPass" label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPass ? 'success' : 'danger'" size="small">
              {{ row.isPass ? '通过' : '未通过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="correctCount" label="正确" width="80">
          <template #default="{ row }">
            <span style="color: #67C23A;">{{ row.correctCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="wrongCount" label="错误" width="80">
          <template #default="{ row }">
            <span style="color: #F56C6C;">{{ row.wrongCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="用时(分钟)" width="100" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-card" style="margin-top: 20px;">
      <div class="page-title">历史错题本</div>
      <el-tabs v-model="wrongTab">
        <el-tab-pane label="全部错题" name="all"></el-tab-pane>
        <el-tab-pane label="按来源分类" name="bySource"></el-tab-pane>
      </el-tabs>
      <div v-if="wrongTab === 'all'">
        <div v-for="(question, index) in allWrongQuestions" :key="question.id" class="question-item" style="margin-bottom: 20px;">
          <div class="question-title">
            <span style="color: #409EFF; font-weight: bold;">第 {{ index + 1 }} 题</span>
            <el-tag size="small" style="margin-left: 10px;">{{ question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '判断题' }}</el-tag>
            <el-tag size="small" :type="question.source === 'practice' ? 'info' : 'warning'" style="margin-left: 5px;">
              {{ question.source === 'practice' ? '练习' : '考试' }}
            </el-tag>
            <span style="margin-left: 10px;">{{ question.content }}</span>
          </div>
          <div class="question-options">
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="question-option" :class="{ correct: question.answer.includes(optionLabels[optIndex]) }">
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
      <div v-else>
        <el-collapse v-model="activeCollapse">
          <el-collapse-item v-for="item in wrongQuestionsBySource" :key="item.key" :title="item.title" :name="item.key">
            <div v-for="(question, index) in item.questions" :key="question.id" class="question-item" style="margin-bottom: 15px;">
              <div class="question-title">
                <span style="color: #409EFF; font-weight: bold;">第 {{ index + 1 }} 题</span>
                <span style="margin-left: 10px;">{{ question.content }}</span>
              </div>
              <div style="margin-top: 10px; color: #67C23A;">正确答案：{{ question.answer }}</div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <el-dialog v-model="detailDialogVisible" title="答题详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="考试名称">{{ currentRecord.examName }}</el-descriptions-item>
        <el-descriptions-item label="得分">
          <span :style="{ color: currentRecord.isPass ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">{{ currentRecord.score }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="考试结果">
          <el-tag :type="currentRecord.isPass ? 'success' : 'danger'" size="small">
            {{ currentRecord.isPass ? '通过' : '未通过' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="正确题数">{{ currentRecord.correctCount }}</el-descriptions-item>
        <el-descriptions-item label="错误题数">{{ currentRecord.wrongCount }}</el-descriptions-item>
        <el-descriptions-item label="答题用时">{{ currentRecord.duration }} 分钟</el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ currentRecord.submitTime }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px;">
        <h4>错题列表</h4>
        <div v-for="(question, index) in currentRecordWrongQuestions" :key="question.id" style="padding: 15px; background: #fef0f0; border-radius: 6px; margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 10px;">{{ index + 1 }}. {{ question.content }}</div>
          <div style="color: #67C23A;">正确答案：{{ question.answer }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { examRecords as mockRecords, exams as mockExams, questions as mockQuestions, practiceRecords as mockPracticeRecords } from '@/data/mockData'

const userStore = useUserStore()
const dateRange = ref([])
const filterResult = ref('')
const wrongTab = ref('all')
const activeCollapse = ref([])
const detailDialogVisible = ref(false)
const currentRecord = ref({})

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

const historyRecords = computed(() => {
  const userId = userStore.user?.id
  const records = mockRecords.filter(r => r.userId === userId)
  return records.map(r => {
    const exam = mockExams.find(e => e.id === r.examId)
    return {
      ...r,
      examName: exam ? exam.name : '未知考试'
    }
  })
})

const practiceRecords = computed(() => {
  const userId = userStore.user?.id
  const storedRecords = window.practiceRecords || []
  const mockPractice = mockPracticeRecords.filter(r => r.userId === userId)
  return [...mockPractice, ...storedRecords]
})

const filteredRecords = computed(() => {
  let records = historyRecords.value
  if (filterResult.value) {
    records = records.filter(r => filterResult.value === 'pass' ? r.isPass : !r.isPass)
  }
  if (dateRange.value && dateRange.value.length === 2) {
    const start = new Date(dateRange.value[0]).getTime()
    const end = new Date(dateRange.value[1]).getTime() + 86400000
    records = records.filter(r => {
      const t = new Date(r.submitTime).getTime()
      return t >= start && t <= end
    })
  }
  return records
})

const allWrongQuestions = computed(() => {
  const wrongQs = []

  historyRecords.value.forEach(record => {
    if (!record.isPass) {
      const exam = mockExams.find(e => e.id === record.examId)
      if (exam) {
        exam.questions.forEach(qId => {
          const question = mockQuestions.find(q => q.id === qId)
          if (question) {
            const userAnswer = record.answers[qId]
            const correctAnswer = question.answer
            const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
            if (userAnswerStr !== correctAnswer && !wrongQs.find(q => q.id === qId)) {
              wrongQs.push({ ...question, source: 'exam' })
            }
          }
        })
      }
    }
  })

  practiceRecords.value.forEach(record => {
    record.questions.forEach(question => {
      const userAnswer = record.userAnswers[question.id]
      const correctAnswer = question.answer
      const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
      if (userAnswer && userAnswerStr !== correctAnswer && !wrongQs.find(q => q.id === question.id)) {
        wrongQs.push({ ...question, source: 'practice' })
      }
    })
  })

  return wrongQs
})

const wrongQuestionsBySource = computed(() => {
  const examWrongQs = []
  const practiceWrongQs = []

  historyRecords.value.forEach(record => {
    if (!record.isPass) {
      const exam = mockExams.find(e => e.id === record.examId)
      if (exam) {
        exam.questions.forEach(qId => {
          const question = mockQuestions.find(q => q.id === qId)
          if (question) {
            const userAnswer = record.answers[qId]
            const correctAnswer = question.answer
            const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
            if (userAnswerStr !== correctAnswer && !examWrongQs.find(q => q.id === qId)) {
              examWrongQs.push(question)
            }
          }
        })
      }
    }
  })

  practiceRecords.value.forEach(record => {
    record.questions.forEach(question => {
      const userAnswer = record.userAnswers[question.id]
      const correctAnswer = question.answer
      const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
      if (userAnswer && userAnswerStr !== correctAnswer && !practiceWrongQs.find(q => q.id === question.id)) {
        practiceWrongQs.push(question)
      }
    })
  })

  const result = []
  if (examWrongQs.length > 0) {
    result.push({ key: 'exam', title: `考试错题 (${examWrongQs.length})`, questions: examWrongQs })
  }
  if (practiceWrongQs.length > 0) {
    result.push({ key: 'practice', title: `练习错题 (${practiceWrongQs.length})`, questions: practiceWrongQs })
  }
  return result
})

const currentRecordWrongQuestions = computed(() => {
  if (!currentRecord.value.answers) return []
  const exam = mockExams.find(e => e.id === currentRecord.value.examId)
  if (!exam) return []
  const wrongQs = []
  exam.questions.forEach(qId => {
    const question = mockQuestions.find(q => q.id === qId)
    if (question) {
      const userAnswer = currentRecord.value.answers[qId]
      const correctAnswer = question.answer
      const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
      if (userAnswerStr !== correctAnswer) {
        wrongQs.push(question)
      }
    }
  })
  return wrongQs
})

const viewDetail = (record) => {
  currentRecord.value = { ...record }
  detailDialogVisible.value = true
}
</script>
