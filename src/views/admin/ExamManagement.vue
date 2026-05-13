<template>
  <div class="page-card">
    <div class="page-title">考试管理</div>
    <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>创建考试
      </el-button>
      <el-select v-model="filterStatus" placeholder="考试状态" clearable style="width: 120px;">
        <el-option label="草稿" value="draft" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="未开始" value="upcoming" />
        <el-option label="已结束" value="ended" />
      </el-select>
      <el-select v-model="filterCategory" placeholder="考试类目" clearable style="width: 150px;">
        <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索考试名称" clearable style="width: 200px;">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>
    <div style="overflow-x: auto;">
    <el-table :data="filteredExams" border stripe style="min-width: 1200px;">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="考试名称" width="250" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ongoing' ? 'success' : row.status === 'upcoming' ? 'warning' : row.status === 'draft' ? 'info' : 'info'">
            {{ row.status === 'ongoing' ? '进行中' : row.status === 'upcoming' ? '未开始' : row.status === 'draft' ? '草稿' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column prop="duration" label="时长(分钟)" width="100" />
      <el-table-column label="考试对象" width="120">
        <template #default="{ row }">
          <span v-if="row.targetType === 'all'">全员</span>
          <span v-else-if="row.targetType === 'department'">指定部门</span>
          <span v-else-if="row.targetType === 'user'">指定人员</span>
          <span v-else>全员</span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="考试类目" width="120">
        <template #default="{ row }">
          {{ getCategoryName(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="passScore" label="及格分" width="80" />
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" size="small" @click="handleViewDetail(row)">详情</el-button>
          <el-button type="warning" size="small" @click="handleStatusChange(row)">
            {{ row.status === 'draft' ? '发布' : row.status === 'ongoing' ? '暂停' : row.status === 'upcoming' ? '发布' : '重启' }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
    <el-form :model="examForm" :rules="rules" ref="examFormRef" label-width="120px">
      <el-form-item label="考试名称" prop="name">
        <el-input v-model="examForm.name" placeholder="请输入考试名称" />
      </el-form-item>
      <el-form-item label="考试类目" prop="category">
        <el-select v-model="examForm.category" placeholder="请选择类目" style="width: 100%">
          <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
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
      <el-form-item label="及格分数" prop="passScore">
        <el-input-number v-model="examForm.passScore" :min="0" :max="100" />
        <span style="margin-left: 10px;">分</span>
      </el-form-item>

      <el-divider content-position="left">题目配比配置</el-divider>
      <el-form-item label="题目配比">
        <div style="width: 100%;">
          <div v-for="(item, index) in examForm.questionConfig" :key="index" style="display: flex; gap: 8px; margin-bottom: 10px; align-items: center; flex-wrap: wrap;">
            <el-tree-select v-model="item.categoryId" :data="categoryTree" :props="{ label: 'name', children: 'children', value: 'id' }" placeholder="选择类目" style="width: 180px;" check-strictly clearable />
            <el-select v-model="item.type" placeholder="题型" style="width: 100px;">
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multiple" />
              <el-option label="判断题" value="judge" />
            </el-select>
            <el-input-number v-model="item.count" :min="0" :max="50" size="small" style="width: 120px;" />
            <span style="font-size: 13px; color: #666;">题</span>
            <span style="margin: 0 4px;">每题</span>
            <el-input-number v-model="item.scorePerQuestion" :min="1" :max="20" size="small" style="width: 110px;" />
            <span style="font-size: 13px; color: #666;">分</span>
            <el-button type="danger" size="small" @click="removeQuestionConfig(index)">删除</el-button>
          </div>
          <el-button type="primary" size="small" @click="addQuestionConfig">
            <el-icon><Plus /></el-icon>添加一行
          </el-button>
          <div v-if="examForm.questionConfig.length > 0" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
            <div style="font-size: 13px; color: #606266;">
              <span>汇总：</span>
              <span v-for="(count, type) in configSummary" :key="type" style="margin-right: 15px;">
                {{ typeLabel(type) }} {{ count }} 题
              </span>
              <span style="font-weight: bold;">共 {{ totalConfigCount }} 题 / 总分 {{ totalConfigScore }} 分</span>
            </div>
          </div>
          <div style="margin-top: 5px; font-size: 12px; color: #999;">
            提示：实际考试时从指定类目中随机抽取对应数量的题目，形成统一试卷
          </div>
        </div>
      </el-form-item>

      <el-divider content-position="left">考试对象配置</el-divider>
      <el-form-item label="考试对象" prop="targetType">
        <el-radio-group v-model="examForm.targetType">
          <el-radio label="all">全员可参加</el-radio>
          <el-radio label="department">指定部门</el-radio>
          <el-radio label="user">指定人员</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="examForm.targetType === 'department'" label="选择部门">
        <el-select v-model="examForm.targetDepartments" multiple placeholder="请选择部门" style="width: 100%">
          <el-option label="技术部" value="技术部" />
          <el-option label="运维部" value="运维部" />
          <el-option label="检修部" value="检修部" />
          <el-option label="安全部" value="安全部" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="examForm.targetType === 'user'" label="选择人员">
        <el-select v-model="examForm.targetUsers" multiple placeholder="请选择人员" style="width: 100%">
          <el-option label="王五" value="4" />
          <el-option label="赵六" value="5" />
          <el-option label="钱七" value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="参加限制">
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <div>
            <span style="margin-right: 10px;">允许参加次数：</span>
            <el-input-number v-model="examForm.maxAttempts" :min="1" :max="99" size="small" /> 次
          </div>
          <div>
            <el-checkbox v-model="examForm.requireMaterialCompletion">必须先完成关联学习资料才能参加考试</el-checkbox>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="关联资料">
        <el-select v-model="examForm.relatedMaterials" multiple placeholder="请选择关联的学习资料" style="width: 100%">
          <el-option label="安全生产规程" value="1" />
          <el-option label="设备操作手册" value="2" />
          <el-option label="应急处理指南" value="3" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
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
      <el-descriptions-item label="题目数量">{{ getExamQuestionCount(currentExam) }} 道</el-descriptions-item>
      <el-descriptions-item label="总分">{{ getExamTotalScore(currentExam) }} 分</el-descriptions-item>
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
    <div style="margin-top: 20px; border-top: 1px solid #ebeef5; padding-top: 20px;">
      <h4 style="margin-bottom: 15px;">推广海报</h4>
      <div style="display: flex; gap: 20px; align-items: flex-start;">
        <div style="width: 260px; flex-shrink: 0; background: #f5f7fa; display: flex; align-items: center; justify-content: center; border: 1px solid #e4e7ed; border-radius: 8px; overflow: hidden;">
          <img v-if="detailPosterUrl" :src="detailPosterUrl" style="width: 100%; display: block;" />
          <div v-else style="padding: 40px 20px; text-align: center; color: #999;">
            <el-icon :size="48"><Picture /></el-icon>
            <p style="margin-top: 10px;">暂未生成海报</p>
          </div>
        </div>
        <div style="flex: 1;">
          <p style="margin-bottom: 15px; color: #606266; font-size: 14px;">扫码或通过海报二维码参加考试</p>
          <p style="margin-bottom: 15px; color: #409eff; font-size: 14px; font-weight: bold;">考试码：{{ currentExam.qrcode || 'EXAM_' + String(currentExam.id).padStart(3, '0') }}</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <el-button type="primary" @click="handleDownloadPosterFromDetail">
              <el-icon><Download /></el-icon> 下载推广海报
            </el-button>
            <el-button @click="handleChangePosterBg">
              <el-icon><Picture /></el-icon> 更换背景图
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 更换海报背景图对话框 -->
  <el-dialog v-model="bgDialogVisible" title="更换海报背景图" width="500px">
    <div style="margin-bottom: 20px;">
      <el-alert title="支持上传 JPG、PNG 格式的图片，建议尺寸 750×1200px" type="info" :closable="false" show-icon />
    </div>
    <el-upload
      drag
      action="#"
      :auto-upload="false"
      :on-change="handleBgUpload"
      accept=".jpg,.jpeg,.png"
      :limit="1"
      :file-list="bgFileList"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">建议使用 750×1200px 的图片</div>
      </template>
    </el-upload>
    <div v-if="posterBgPreviewUrl" style="margin-top: 20px; text-align: center;">
      <p style="margin-bottom: 10px; color: #666;">背景图预览：</p>
      <img :src="posterBgPreviewUrl" style="max-width: 200px; max-height: 300px; border-radius: 6px; border: 1px solid #e4e7ed;" />
    </div>
    <template #footer>
      <el-button @click="bgDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmBgChange" :disabled="!posterBgPreviewUrl">确认更换</el-button>
    </template>
  </el-dialog>

  <!-- 考试推广图片预览对话框 -->
  <el-dialog v-model="posterDialogVisible" title="考试发布成功" width="500px">
    <div class="poster-preview" style="text-align: center;">
      <img :src="posterImageUrl" style="width: 100%; max-width: 375px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
      <p style="margin-top: 20px; color: #606266; font-size: 14px; line-height: 1.6;">
        请下载图片并分享给员工<br>
        员工扫码即可参加考试
      </p>
    </div>
    <template #footer>
      <el-button @click="posterDialogVisible = false">关闭</el-button>
      <el-button type="primary" @click="downloadPoster">
        <el-icon><Download /></el-icon> 下载图片
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { exams as mockExams, categories as mockCategories, systemConfig as mockSystemConfig } from '@/data/mockData'
import QRCode from 'qrcode'

const dialogVisible = ref(false)
const dialogTitle = ref('创建考试')
const isEdit = ref(false)
const examFormRef = ref(null)
const examList = ref([...mockExams])

const filterStatus = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

const detailDialogVisible = ref(false)
const currentExam = ref({})

const posterDialogVisible = ref(false)
const posterImageUrl = ref('')
const posterExamData = ref({})

const detailPosterUrl = ref('')
const posterBackgroundUrl = ref(mockSystemConfig.posterBackground || '')

const bgDialogVisible = ref(false)
const bgFileList = ref([])
const posterBgPreviewUrl = ref('')

const categoryList = computed(() => mockCategories)

const categoryTree = computed(() => {
  const buildTree = (parentId = null) => {
    return categoryList.value
      .filter(c => c.parentId === parentId && c.status !== 'disabled')
      .map(c => ({
        ...c,
        children: buildTree(c.id)
      }))
  }
  return buildTree(null)
})

const typeLabel = (type) => {
  const labels = { single: '单选题', multiple: '多选题', judge: '判断题' }
  return labels[type] || type
}

const configSummary = computed(() => {
  const summary = {}
  examForm.questionConfig.forEach(item => {
    if (item.count > 0) {
      summary[item.type] = (summary[item.type] || 0) + item.count
    }
  })
  return summary
})

const totalConfigCount = computed(() => {
  return examForm.questionConfig.reduce((sum, item) => sum + (item.count || 0), 0)
})

const totalConfigScore = computed(() => {
  return examForm.questionConfig.reduce((sum, item) => sum + (item.count || 0) * (item.scorePerQuestion || 0), 0)
})

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
  category: '',
  startTime: '',
  endTime: '',
  duration: 30,
  passScore: 60,
  questionConfig: [
    { categoryId: null, type: 'single', count: 5, scorePerQuestion: 5 },
    { categoryId: null, type: 'multiple', count: 3, scorePerQuestion: 5 },
    { categoryId: null, type: 'judge', count: 2, scorePerQuestion: 5 }
  ],
  status: 'draft',
  createTime: '',
  creator: 'admin',
  qrcode: '',
  targetType: 'all',
  targetDepartments: [],
  targetUsers: [],
  maxAttempts: 1,
  requireMaterialCompletion: false,
  relatedMaterials: []
})

const rules = {
  name: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }],
  passScore: [{ required: true, message: '请输入及格分数', trigger: 'blur' }]
}

const addQuestionConfig = () => {
  examForm.questionConfig.push({ categoryId: null, type: 'single', count: 5, scorePerQuestion: 5 })
}

const removeQuestionConfig = (index) => {
  if (examForm.questionConfig.length > 1) {
    examForm.questionConfig.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一条配比规则')
  }
}

const filteredExams = computed(() => {
  return examList.value.filter(exam => {
    if (filterStatus.value && exam.status !== filterStatus.value) return false
    if (filterCategory.value && exam.category !== filterCategory.value) return false
    if (searchKeyword.value && !exam.name.includes(searchKeyword.value)) return false
    return true
  })
})

const getCategoryName = (categoryId) => {
  const cat = categoryList.value.find(c => c.id === categoryId)
  return cat ? cat.name : ''
}

const getExamQuestionCount = (exam) => {
  if (exam.questionConfig && Array.isArray(exam.questionConfig)) {
    return exam.questionConfig.reduce((sum, item) => sum + (item.count || 0), 0)
  }
  return exam.questionCount || 0
}

const getExamTotalScore = (exam) => {
  if (exam.questionConfig && Array.isArray(exam.questionConfig)) {
    return exam.questionConfig.reduce((sum, item) => sum + (item.count || 0) * (item.scorePerQuestion || 0), 0)
  }
  return exam.totalScore || 0
}

const resetForm = () => {
  Object.assign(examForm, {
    id: null,
    name: '',
    type: 'exam',
    category: '',
    startTime: '',
    endTime: '',
    duration: 30,
    passScore: 60,
    questionConfig: [
      { categoryId: null, type: 'single', count: 5, scorePerQuestion: 5 },
      { categoryId: null, type: 'multiple', count: 3, scorePerQuestion: 5 },
      { categoryId: null, type: 'judge', count: 2, scorePerQuestion: 5 }
    ],
    status: 'draft',
    createTime: '',
    creator: 'admin',
    qrcode: '',
    targetType: 'all',
    targetDepartments: [],
    targetUsers: [],
    maxAttempts: 1,
    requireMaterialCompletion: false,
    relatedMaterials: []
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
  const qConfig = row.questionConfig || [
    { categoryId: null, type: 'single', count: 5, scorePerQuestion: 5 },
    { categoryId: null, type: 'multiple', count: 3, scorePerQuestion: 5 },
    { categoryId: null, type: 'judge', count: 2, scorePerQuestion: 5 }
  ]
  Object.assign(examForm, { ...row, questionConfig: JSON.parse(JSON.stringify(qConfig)) })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!examFormRef.value) return
  await examFormRef.value.validate((valid) => {
    if (valid) {
      if (totalConfigCount.value === 0) {
        ElMessage.warning('请至少配置一道题目')
        return
      }
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

const handleDownloadPosterFromDetail = async () => {
  if (!currentExam.value.id) return
  await generateExamPoster(currentExam.value)
  downloadPoster()
}

const handleViewDetail = async (row) => {
  currentExam.value = { ...row }
  detailDialogVisible.value = true
  await generateExamPoster(row)
  detailPosterUrl.value = posterImageUrl.value
}

// ===== 更换海报背景图 =====
const handleChangePosterBg = () => {
  posterBgPreviewUrl.value = ''
  bgFileList.value = []
  bgDialogVisible.value = true
}

const handleBgUpload = (file) => {
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  if (!isImage) {
    ElMessage.error('仅支持 JPG、PNG 格式')
    return
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    return
  }
  posterBgPreviewUrl.value = URL.createObjectURL(file.raw)
  ElMessage.success('图片上传成功')
}

const confirmBgChange = () => {
  if (!posterBgPreviewUrl.value) return
  posterBackgroundUrl.value = posterBgPreviewUrl.value
  mockSystemConfig.posterBackground = posterBgPreviewUrl.value
  ElMessage.success('背景图已更换')
  bgDialogVisible.value = false
  if (currentExam.value.id) {
    generateExamPoster(currentExam.value).then(() => {
      detailPosterUrl.value = posterImageUrl.value
    })
  }
}

const handleCopy = (row) => {
  ElMessageBox.confirm('确定要复制该考试吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const newExam = {
      ...row,
      id: examList.value.length + 1,
      name: row.name + ' (副本)',
      status: 'draft',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      qrcode: 'EXAM_' + String(examList.value.length + 1).padStart(3, '0')
    }
    examList.value.push(newExam)
    ElMessage.success('考试复制成功')
  }).catch(() => {})
}

const handleStatusChange = async (row) => {
  const statusMap = {
    'draft': { newStatus: 'ongoing', message: '发布' },
    'upcoming': { newStatus: 'ongoing', message: '发布' },
    'ongoing': { newStatus: 'paused', message: '暂停' },
    'paused': { newStatus: 'ongoing', message: '重启' },
    'ended': { newStatus: 'ongoing', message: '重启' }
  }

  const { newStatus, message } = statusMap[row.status]
  const isPublishing = row.status === 'draft' || row.status === 'upcoming'
  const examData = { ...row }

  ElMessageBox.confirm(`确定要${message}该考试吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const index = examList.value.findIndex(e => e.id === row.id)
    if (index !== -1) {
      examList.value[index].status = newStatus
    }

    if (isPublishing) {
      await generateExamPoster(examData)
      posterDialogVisible.value = true
    }

    ElMessage.success(`考试已${message}`)
  }).catch(() => {})
}

// 绘制圆角矩形辅助函数
const drawRoundRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// 生成考试推广图片
const generateExamPoster = async (exam) => {
  try {
    posterExamData.value = exam

    // 生成二维码数据URL
    const examUrl = `${window.location.origin}/exam/${exam.id}`
    const qrCodeDataUrl = await QRCode.toDataURL(examUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })

    // 创建Canvas
    const canvas = document.createElement('canvas')
    canvas.width = 750
    canvas.height = 1200
    const ctx = canvas.getContext('2d')

    // 绘制背景图片（如果配置了背景图）
    let hasBgImage = false
    if (posterBackgroundUrl.value) {
      try {
        const bgImg = new Image()
        bgImg.crossOrigin = 'anonymous'
        bgImg.src = posterBackgroundUrl.value
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve
          bgImg.onerror = reject
        })
        ctx.drawImage(bgImg, 0, 0, 750, 1200)
        hasBgImage = true
      } catch {
        hasBgImage = false
      }
    }

    if (!hasBgImage) {
      // 无背景图时使用默认配色方案
      // 绘制背景
      ctx.fillStyle = '#f5f7fa'
      ctx.fillRect(0, 0, 750, 1200)

      // 绘制顶部装饰条（国网绿）
      ctx.fillStyle = '#009944'
      ctx.fillRect(0, 0, 750, 120)

      // 绘制顶部标题
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('国网后勤考试', 375, 75)
    } else {
      // 有背景图时，半透明遮罩增强文字可读性
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, 750, 120)

      // 绘制顶部标题
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('国网后勤考试', 375, 75)
    }

    // 绘制主内容区域背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
    drawRoundRect(ctx, 40, 140, 670, 640, 16)
    ctx.fill()

    // 绘制考试名称
    ctx.fillStyle = '#303133'
    ctx.font = 'bold 40px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    // 处理长名称换行
    const maxWidth = 600
    const name = exam.name || '未命名考试'
    if (ctx.measureText(name).width > maxWidth) {
      ctx.font = 'bold 32px "Microsoft YaHei", sans-serif'
    }
    ctx.fillText(name, 375, 210)

    // 绘制分隔线
    ctx.strokeStyle = '#e4e7ed'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(80, 250)
    ctx.lineTo(670, 250)
    ctx.stroke()

    // 绘制考试信息
    ctx.textAlign = 'left'
    ctx.font = '28px "Microsoft YaHei", sans-serif'

    const infoItems = [
      { icon: '📅', label: '考试时间', value: exam.startTime || '待定' },
      { icon: '⏱️', label: '考试时长', value: `${exam.duration || 0}分钟` },
      { icon: '📝', label: '题目数量', value: `${getExamQuestionCount(exam)}题 / ${getExamTotalScore(exam)}分` },
      { icon: '🎯', label: '及格分数', value: `${exam.passScore || 0}分` }
    ]

    let yPos = 310
    infoItems.forEach(item => {
      // 绘制图标
      ctx.font = '28px "Microsoft YaHei", sans-serif'
      ctx.fillText(item.icon, 100, yPos)

      // 绘制标签
      ctx.fillStyle = '#606266'
      ctx.font = '26px "Microsoft YaHei", sans-serif'
      ctx.fillText(`${item.label}：`, 145, yPos)

      // 绘制值
      ctx.fillStyle = '#303133'
      ctx.font = 'bold 26px "Microsoft YaHei", sans-serif'
      ctx.fillText(item.value, 280, yPos)

      yPos += 70
    })

    // 绘制二维码区域背景
    ctx.fillStyle = '#f5f7fa'
    drawRoundRect(ctx, 200, 820, 350, 280, 16)
    ctx.fill()

    // 绘制二维码
    const qrImage = new Image()
    qrImage.src = qrCodeDataUrl
    await new Promise((resolve) => {
      qrImage.onload = resolve
    })
    ctx.drawImage(qrImage, 275, 840, 200, 200)

    // 绘制扫码提示
    ctx.fillStyle = '#606266'
    ctx.font = '24px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('扫码参加考试', 375, 1070)

    // 绘制考试码
    ctx.fillStyle = '#009944'
    ctx.font = 'bold 22px "Microsoft YaHei", sans-serif'
    ctx.fillText(`考试码：${exam.qrcode || 'EXAM_' + String(exam.id).padStart(3, '0')}`, 375, 1105)

    // 绘制底部品牌区域
    ctx.fillStyle = '#009944'
    ctx.fillRect(0, 1140, 750, 60)
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px "Microsoft YaHei", sans-serif'
    ctx.fillText('国网后勤考试系统', 375, 1180)

    // 生成图片URL
    posterImageUrl.value = canvas.toDataURL('image/png')
  } catch (error) {
    console.error('生成推广图片失败:', error)
    ElMessage.error('生成推广图片失败')
  }
}

// 下载推广图片
const downloadPoster = () => {
  const link = document.createElement('a')
  link.download = `考试海报_${posterExamData.value.name}.png`
  link.href = posterImageUrl.value
  link.click()
  ElMessage.success('图片下载成功')
}
</script>
