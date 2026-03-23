<template>
  <div>
    <div class="page-card">
      <div class="page-title">可参与的考试</div>
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="考试状态" clearable class="filter-select">
          <el-option label="进行中" value="ongoing" />
          <el-option label="未开始" value="upcoming" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索考试名称" clearable class="filter-input">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <div v-if="filteredExams.length === 0" class="empty-tip">
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
            <span><el-icon><Clock /></el-icon> {{ exam.duration }}分钟</span>
            <span><el-icon><Document /></el-icon> {{ exam.questionCount }}题</span>
            <span><el-icon><Star /></el-icon> {{ exam.totalScore }}分</span>
            <span><el-icon><CircleCheck /></el-icon> 及格{{ exam.passScore }}分</span>
          </div>
          <div class="exam-card-time">
            <span>开始：{{ exam.startTime }}</span>
            <span>结束：{{ exam.endTime }}</span>
          </div>
          <div class="exam-card-action">
            <el-button v-if="exam.status === 'ongoing'" type="primary" @click.stop="startExam(exam)">开始答题</el-button>
            <el-button v-else type="info" disabled>未开始</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="detailDialogVisible" title="考试详情" width="500px" class="exam-detail-dialog">
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
import { exams as mockExams } from '../../data/mockData'

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

<style scoped>
.filter-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  width: 120px;
}

.filter-input {
  width: 200px;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}

.exam-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.exam-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.exam-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exam-card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.exam-card-info {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
  flex-wrap: wrap;
}

.exam-card-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.exam-card-time {
  margin-top: 10px;
  color: #666;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.exam-card-action {
  margin-top: 15px;
  text-align: right;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }
  
  .filter-select,
  .filter-input {
    width: 100%;
  }
  
  .exam-card {
    padding: 15px;
  }
  
  .exam-card-title {
    font-size: 15px;
  }
  
  .exam-card-info {
    gap: 10px;
    font-size: 13px;
  }
  
  .exam-card-time {
    font-size: 12px;
  }
  
  .exam-card-action {
    margin-top: 12px;
  }
  
  .exam-card-action .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .exam-card-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
