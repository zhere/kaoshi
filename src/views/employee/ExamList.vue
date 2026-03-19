<template>
  <div>
    <div class="page-card">
      <div class="page-title">可参与的考试</div>
      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <el-select v-model="filterStatus" placeholder="考试状态" clearable style="width: 120px;">
          <el-option label="进行中" value="ongoing" />
          <el-option label="未开始" value="upcoming" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索考试名称" clearable style="width: 200px;">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <div v-if="filteredExams.length === 0" style="text-align: center; padding: 40px; color: #999;">
        暂无可参与的考试
      </div>
      <div v-else>
        <div v-for="exam in filteredExams" :key="exam.id" class="exam-card" @click="viewExamDetail(exam)">
          <div class="exam-card-header">
            <span class="exam-card-title">{{ exam.name }}</span>
            <el-tag :type="exam.status === 'ongoing' ? 'success' : 'warning'" size="small">
              {{ exam.status === 'ongoing' ? '进行中' : '未开始' }}
            </el-tag>
          </div>
          <div class="exam-card-info">
            <span><el-icon><Clock /></el-icon> 时长：{{ exam.duration }}分钟</span>
            <span><el-icon><Document /></el-icon> 题目：{{ exam.questionCount }}道</span>
            <span><el-icon><Star /></el-icon> 总分：{{ exam.totalScore }}分</span>
            <span><el-icon><CircleCheck /></el-icon> 及格：{{ exam.passScore }}分</span>
          </div>
          <div style="margin-top: 10px; color: #666; font-size: 13px;">
            <span>开始：{{ exam.startTime }}</span>
            <span style="margin-left: 20px;">结束：{{ exam.endTime }}</span>
          </div>
          <div style="margin-top: 15px; text-align: right;">
            <el-button v-if="exam.status === 'ongoing'" type="primary" @click.stop="startExam(exam)">开始答题</el-button>
            <el-button v-else type="info" disabled>未开始</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="detailDialogVisible" title="考试详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="考试名称">{{ currentExam.name }}</el-descriptions-item>
        <el-descriptions-item label="考试状态">
          <el-tag :type="currentExam.status === 'ongoing' ? 'success' : 'warning'" size="small">
            {{ currentExam.status === 'ongoing' ? '进行中' : '未开始' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentExam.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentExam.endTime }}</el-descriptions-item>
        <el-descriptions-item label="考试时长">{{ currentExam.duration }} 分钟</el-descriptions-item>
        <el-descriptions-item label="题目数量">{{ currentExam.questionCount }} 道</el-descriptions-item>
        <el-descriptions-item label="试卷总分">{{ currentExam.totalScore }} 分</el-descriptions-item>
        <el-descriptions-item label="及格分数">{{ currentExam.passScore }} 分</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button v-if="currentExam.status === 'ongoing'" type="primary" @click="startExam(currentExam)">开始答题</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { exams as mockExams } from '@/data/mockData'

const router = useRouter()
const examList = ref([...mockExams.filter(e => e.status !== 'ended')])
const filterStatus = ref('')
const searchKeyword = ref('')
const detailDialogVisible = ref(false)
const currentExam = ref({})

const filteredExams = computed(() => {
  return examList.value.filter(exam => {
    if (filterStatus.value && exam.status !== filterStatus.value) return false
    if (searchKeyword.value && !exam.name.includes(searchKeyword.value)) return false
    return true
  })
})

const viewExamDetail = (exam) => {
  currentExam.value = { ...exam }
  detailDialogVisible.value = true
}

const startExam = (exam) => {
  ElMessageBox.confirm('确定要开始答题吗？开始后将计时，请确保有足够时间完成。', '提示', {
    confirmButtonText: '开始答题',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    router.push(`/employee/exam/${exam.id}`)
  }).catch(() => {})
}
</script>
