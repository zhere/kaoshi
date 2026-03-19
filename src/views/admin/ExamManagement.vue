<template>
  <div class="page-card">
    <div class="page-title">考试管理</div>
    <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>创建考试
      </el-button>
      <el-select v-model="filterStatus" placeholder="考试状态" clearable style="width: 120px;">
        <el-option label="进行中" value="ongoing" />
        <el-option label="未开始" value="upcoming" />
        <el-option label="已结束" value="ended" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索考试名称" clearable style="width: 200px;">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>
    <el-table :data="filteredExams" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="考试名称" width="250" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ongoing' ? 'success' : row.status === 'upcoming' ? 'warning' : 'info'">
            {{ row.status === 'ongoing' ? '进行中' : row.status === 'upcoming' ? '未开始' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column prop="duration" label="时长(分钟)" width="100" />
      <el-table-column prop="questionCount" label="题目数" width="80" />
      <el-table-column prop="totalScore" label="总分" width="80" />
      <el-table-column prop="passScore" label="及格分" width="80" />
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" size="small" @click="handleViewDetail(row)">详情</el-button>
          <el-button type="warning" size="small" @click="handleQRCode(row)">二维码</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
    <el-form :model="examForm" :rules="rules" ref="examFormRef" label-width="120px">
      <el-form-item label="考试名称" prop="name">
        <el-input v-model="examForm.name" placeholder="请输入考试名称" />
      </el-form-item>
      <el-form-item label="考试类型" prop="type">
        <el-radio-group v-model="examForm.type">
          <el-radio label="exam">正式考试</el-radio>
          <el-radio label="practice">练习模式</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker v-model="examForm.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker v-model="examForm.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="考试时长" prop="duration">
        <el-input-number v-model="examForm.duration" :min="10" :max="180" />
        <span style="margin-left: 10px;">分钟</span>
      </el-form-item>
      <el-form-item label="题目数量" prop="questionCount">
        <el-input-number v-model="examForm.questionCount" :min="5" :max="100" />
      </el-form-item>
      <el-form-item label="每题分值" prop="scorePerQuestion">
        <el-input-number v-model="examForm.scorePerQuestion" :min="1" :max="10" />
        <span style="margin-left: 10px;">分</span>
      </el-form-item>
      <el-form-item label="及格分数" prop="passScore">
        <el-input-number v-model="examForm.passScore" :min="0" :max="100" />
        <span style="margin-left: 10px;">分</span>
      </el-form-item>
      <el-form-item label="选择题目" prop="questions">
        <el-button type="primary" size="small" @click="showQuestionSelector">从题库选择</el-button>
        <div v-if="examForm.questions.length > 0" style="margin-top: 10px;">
          <el-tag v-for="qId in examForm.questions" :key="qId" style="margin: 2px;">题目{{ qId }}</el-tag>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="questionSelectorVisible" title="从题库选择题目" width="800px">
    <div style="margin-bottom: 15px; display: flex; gap: 10px;">
      <el-select v-model="questionFilter.category" placeholder="分类" clearable style="width: 150px;">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-select v-model="questionFilter.type" placeholder="类型" clearable style="width: 120px;">
        <el-option label="单选题" value="single" />
        <el-option label="多选题" value="multiple" />
        <el-option label="判断题" value="judge" />
      </el-select>
      <el-select v-model="questionFilter.difficulty" placeholder="难度" clearable style="width: 100px;">
        <el-option label="简单" value="easy" />
        <el-option label="中等" value="medium" />
        <el-option label="困难" value="hard" />
      </el-select>
    </div>
    <el-table :data="filteredQuestionsForSelect" border stripe max-height="400" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag size="small">{{ row.type === 'single' ? '单选' : row.type === 'multiple' ? '多选' : '判断' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          {{ getCategoryName(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
      <el-table-column prop="difficulty" label="难度" width="80">
        <template #default="{ row }">
          <el-tag :type="row.difficulty === 'easy' ? 'success' : row.difficulty === 'medium' ? 'warning' : 'danger'" size="small">
            {{ row.difficulty === 'easy' ? '简单' : row.difficulty === 'medium' ? '中等' : '困难' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 15px;">
      已选择 <strong>{{ selectedQuestions.length }}</strong> 道题目
    </div>
    <template #footer>
      <el-button @click="questionSelectorVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmQuestionSelection">确定选择</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="detailDialogVisible" title="考试详情" width="700px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="考试名称">{{ currentExam.name }}</el-descriptions-item>
      <el-descriptions-item label="考试状态">
        <el-tag :type="currentExam.status === 'ongoing' ? 'success' : currentExam.status === 'upcoming' ? 'warning' : 'info'">
          {{ currentExam.status === 'ongoing' ? '进行中' : currentExam.status === 'upcoming' ? '未开始' : '已结束' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ currentExam.startTime }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ currentExam.endTime }}</el-descriptions-item>
      <el-descriptions-item label="考试时长">{{ currentExam.duration }} 分钟</el-descriptions-item>
      <el-descriptions-item label="题目数量">{{ currentExam.questionCount }} 道</el-descriptions-item>
      <el-descriptions-item label="总分">{{ currentExam.totalScore }} 分</el-descriptions-item>
      <el-descriptions-item label="及格分">{{ currentExam.passScore }} 分</el-descriptions-item>
      <el-descriptions-item label="创建人">{{ currentExam.creator }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ currentExam.createTime }}</el-descriptions-item>
    </el-descriptions>
    <div style="margin-top: 20px;">
      <h4>参与统计</h4>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ examStats.totalParticipants }}</div>
            <div class="stat-label">参与人数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ examStats.passRate }}%</div>
            <div class="stat-label">通过率</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ examStats.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ examStats.highestScore }}</div>
            <div class="stat-label">最高分</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-dialog>

  <el-dialog v-model="qrcodeDialogVisible" title="考试二维码" width="400px">
    <div class="qrcode-container">
      <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">{{ currentExam.name }}</p>
      <div class="qrcode-image">
        <div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 1px solid #ddd;">
          <span style="color: #999;">二维码图片</span>
        </div>
      </div>
      <p style="margin-top: 15px; color: #666;">扫码参与考试</p>
      <p style="color: #409eff; font-size: 14px;">考试码：{{ currentExam.qrcode }}</p>
      <el-button type="primary" style="margin-top: 15px;" @click="downloadQRCode">下载二维码</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { exams as mockExams, questions as mockQuestions, categories as mockCategories } from '@/data/mockData'

const dialogVisible = ref(false)
const dialogTitle = ref('创建考试')
const isEdit = ref(false)
const examFormRef = ref(null)
const examList = ref([...mockExams])
const categories = computed(() => mockCategories)

const filterStatus = ref('')
const searchKeyword = ref('')

const questionSelectorVisible = ref(false)
const selectedQuestions = ref([])
const questionFilter = reactive({
  category: '',
  type: '',
  difficulty: ''
})

const detailDialogVisible = ref(false)
const currentExam = ref({})

const qrcodeDialogVisible = ref(false)

const examStats = reactive({
  totalParticipants: 15,
  passRate: 80,
  averageScore: 74,
  highestScore: 95
})

const examForm = reactive({
  id: null,
  name: '',
  type: 'exam',
  startTime: '',
  endTime: '',
  duration: 30,
  questionCount: 20,
  scorePerQuestion: 5,
  passScore: 60,
  questions: [],
  status: 'upcoming',
  totalScore: 100,
  createTime: '',
  creator: 'admin',
  qrcode: ''
})

const rules = {
  name: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }],
  questionCount: [{ required: true, message: '请输入题目数量', trigger: 'blur' }],
  passScore: [{ required: true, message: '请输入及格分数', trigger: 'blur' }]
}

const filteredExams = computed(() => {
  return examList.value.filter(exam => {
    if (filterStatus.value && exam.status !== filterStatus.value) return false
    if (searchKeyword.value && !exam.name.includes(searchKeyword.value)) return false
    return true
  })
})

const filteredQuestionsForSelect = computed(() => {
  return mockQuestions.filter(q => {
    if (questionFilter.category && q.category !== questionFilter.category) return false
    if (questionFilter.type && q.type !== questionFilter.type) return false
    if (questionFilter.difficulty && q.difficulty !== questionFilter.difficulty) return false
    return true
  })
})

const getCategoryName = (categoryId) => {
  const cat = mockCategories.find(c => c.id === categoryId)
  return cat ? cat.name : ''
}

const resetForm = () => {
  Object.assign(examForm, {
    id: null,
    name: '',
    type: 'exam',
    startTime: '',
    endTime: '',
    duration: 30,
    questionCount: 20,
    scorePerQuestion: 5,
    passScore: 60,
    questions: [],
    status: 'upcoming',
    totalScore: 100,
    createTime: '',
    creator: 'admin',
    qrcode: ''
  })
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogTitle.value = '创建考试'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑考试'
  Object.assign(examForm, { ...row })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!examFormRef.value) return
  await examFormRef.value.validate((valid) => {
    if (valid) {
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      if (isEdit.value) {
        const index = examList.value.findIndex(e => e.id === examForm.id)
        if (index !== -1) {
          examList.value[index] = { ...examList.value[index], ...examForm }
        }
        ElMessage.success('编辑成功')
      } else {
        const newExam = {
          ...examForm,
          id: examList.value.length + 1,
          createTime: now,
          qrcode: 'EXAM_' + String(examList.value.length + 1).padStart(3, '0')
        }
        examList.value.push(newExam)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该考试吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = examList.value.findIndex(e => e.id === row.id)
    if (index !== -1) {
      examList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const showQuestionSelector = () => {
  selectedQuestions.value = [...examForm.questions]
  questionSelectorVisible.value = true
}

const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection.map(q => q.id)
}

const confirmQuestionSelection = () => {
  examForm.questions = [...selectedQuestions.value]
  examForm.questionCount = selectedQuestions.value.length
  questionSelectorVisible.value = false
  ElMessage.success(`已选择 ${selectedQuestions.value.length} 道题目`)
}

const handleViewDetail = (row) => {
  currentExam.value = { ...row }
  detailDialogVisible.value = true
}

const handleQRCode = (row) => {
  currentExam.value = { ...row }
  qrcodeDialogVisible.value = true
}

const downloadQRCode = () => {
  ElMessage.success('二维码下载成功')
}
</script>
