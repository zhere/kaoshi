<template>
  <div class="page-card">
    <div class="page-title">考试模板管理</div>
    <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>创建考试模板
      </el-button>
      <el-button type="success" @click="handleUpload">
        <el-icon><Upload /></el-icon>上传考试模板
      </el-button>
      <el-button type="warning" @click="handleAIGenerate">
        <el-icon><MagicStick /></el-icon>AI生成考试模板
      </el-button>
    </div>
    <el-table :data="templateList" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="模板名称" width="200" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="questionCount" label="题目数量" width="100" />
      <el-table-column prop="duration" label="考试时长(分钟)" width="120" />
      <el-table-column prop="passScore" label="及格分数" width="100" />
      <el-table-column label="关联学习资料" min-width="200">
        <template #default="{ row }">
          <div v-if="getTemplateMaterials(row.id).length > 0">
            <el-tag v-for="m in getTemplateMaterials(row.id)" :key="m.id" size="small" style="margin: 2px;">
              {{ m.title }}
            </el-tag>
          </div>
          <el-tag v-else type="info" size="small">未关联</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="difficulty" label="难度设置" width="100">
        <template #default="{ row }">
          <el-tag :type="row.difficulty === 'easy' ? 'success' : row.difficulty === 'medium' ? 'warning' : 'danger'" size="small">
            {{ row.difficulty === 'easy' ? '简单' : row.difficulty === 'medium' ? '中等' : row.difficulty === 'hard' ? '困难' : '混合' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" size="small" @click="handleViewExams(row)">查看考试</el-button>
          <el-button type="warning" size="small" @click="handlePermission(row)">权限设置</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <el-form :model="templateForm" :rules="rules" ref="templateFormRef" label-width="120px">
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="模板描述" prop="description">
        <el-input v-model="templateForm.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
      </el-form-item>
      <el-form-item label="题目分类" prop="categories">
        <el-select v-model="templateForm.categories" multiple placeholder="请选择题目分类" style="width: 100%">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="难度设置" prop="difficulty">
        <el-select v-model="templateForm.difficulty" placeholder="请选择难度" style="width: 100%">
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
          <el-option label="混合" value="mixed" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目数量" prop="questionCount">
        <el-input-number v-model="templateForm.questionCount" :min="5" :max="100" />
      </el-form-item>
      <el-form-item label="考试时长" prop="duration">
        <el-input-number v-model="templateForm.duration" :min="10" :max="180" />
        <span style="margin-left: 10px;">分钟</span>
      </el-form-item>
      <el-form-item label="及格分数" prop="passScore">
        <el-input-number v-model="templateForm.passScore" :min="0" :max="100" />
        <span style="margin-left: 10px;">分</span>
      </el-form-item>
      <el-form-item label="关联学习资料" prop="materials">
        <el-select v-model="templateForm.materials" multiple placeholder="请选择关联的学习资料" style="width: 100%">
          <el-option v-for="m in materials" :key="m.id" :label="m.title" :value="m.id">
            <span>{{ m.title }}</span>
            <el-tag :type="m.type === 'pdf' ? 'danger' : m.type === 'video' ? 'warning' : 'info'" size="small" style="margin-left: 10px;">
              {{ m.type === 'pdf' ? 'PDF' : m.type === 'video' ? '视频' : '文档' }}
            </el-tag>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学习要求">
        <el-switch v-model="templateForm.requiredLearning" active-text="必须完成学习才能参加考试" inactive-text="不强制要求" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="examListDialogVisible" title="模板下的考试列表" width="700px">
    <el-table :data="relatedExams" border stripe>
      <el-table-column prop="name" label="考试名称" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ongoing' ? 'success' : row.status === 'upcoming' ? 'warning' : 'info'">
            {{ row.status === 'ongoing' ? '进行中' : row.status === 'upcoming' ? '未开始' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
    </el-table>
  </el-dialog>

  <el-dialog v-model="permissionDialogVisible" title="模板权限设置" width="500px">
    <el-form label-width="100px">
      <el-form-item label="可见部门">
        <el-select v-model="permissionForm.departments" multiple placeholder="请选择可见部门" style="width: 100%">
          <el-option label="运维部" value="运维部" />
          <el-option label="检修部" value="检修部" />
          <el-option label="安全部" value="安全部" />
          <el-option label="培训部" value="培训部" />
        </el-select>
      </el-form-item>
      <el-form-item label="可见人员">
        <el-radio-group v-model="permissionForm.visibleTo">
          <el-radio label="all">所有人员</el-radio>
          <el-radio label="department">指定部门</el-radio>
          <el-radio label="specific">指定人员</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="permissionForm.visibleTo === 'specific'" label="指定人员">
        <el-select v-model="permissionForm.users" multiple placeholder="请选择人员" style="width: 100%">
          <el-option label="王五" value="emp001" />
          <el-option label="赵六" value="emp002" />
          <el-option label="钱七" value="emp003" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="permissionDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="savePermission">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="uploadDialogVisible" title="上传考试模板" width="500px">
    <el-upload drag action="#" :auto-upload="false" :on-change="handleFileChange" accept=".xlsx,.xls,.csv">
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">支持 Excel、CSV 格式的模板文件</div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="uploadDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmUpload">确认上传</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="aiDialogVisible" title="AI生成考试模板" width="600px">
    <div class="ai-generate-dialog">
      <el-form :model="aiForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="aiForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input v-model="aiForm.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
        </el-form-item>
        <el-form-item label="题目分类">
          <el-select v-model="aiForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度设置">
          <el-select v-model="aiForm.difficulty" placeholder="请选择难度" style="width: 100%">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
            <el-option label="混合" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目数量">
          <el-input-number v-model="aiForm.questionCount" :min="5" :max="100" />
        </el-form-item>
        <el-form-item label="考试时长">
          <el-input-number v-model="aiForm.duration" :min="10" :max="180" />
          <span style="margin-left: 10px;">分钟</span>
        </el-form-item>
        <el-form-item label="生成指令">
          <el-input v-model="aiForm.prompt" type="textarea" :rows="3" placeholder="请输入生成指令，如：生成电气安全操作考试模板" />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="generateTemplate" :loading="aiGenerating" style="width: 100%;">
        <el-icon><MagicStick /></el-icon>开始生成
      </el-button>
      <div v-if="aiGeneratedTemplate" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
        <h4 style="margin: 0 0 10px;">生成的模板：</h4>
        <div style="margin-bottom: 5px;"><strong>模板名称：</strong>{{ aiGeneratedTemplate.name }}</div>
        <div style="margin-bottom: 5px;"><strong>描述：</strong>{{ aiGeneratedTemplate.description }}</div>
        <div style="margin-bottom: 5px;"><strong>题目数量：</strong>{{ aiGeneratedTemplate.questionCount }}道</div>
        <div style="margin-bottom: 5px;"><strong>考试时长：</strong>{{ aiGeneratedTemplate.duration }}分钟</div>
        <div style="margin-bottom: 5px;"><strong>难度：</strong>{{ aiGeneratedTemplate.difficulty === 'easy' ? '简单' : aiGeneratedTemplate.difficulty === 'medium' ? '中等' : aiGeneratedTemplate.difficulty === 'hard' ? '困难' : '混合' }}</div>
      </div>
    </div>
    <template #footer>
      <el-button @click="aiDialogVisible = false">取消</el-button>
      <el-button type="success" @click="saveGeneratedTemplate" :disabled="!aiGeneratedTemplate">保存模板</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { examTemplates as mockTemplates, categories as mockCategories, exams as mockExams, materials as mockMaterials, templateMaterials } from '@/data/mockData'

const dialogVisible = ref(false)
const dialogTitle = ref('创建考试模板')
const isEdit = ref(false)
const templateFormRef = ref(null)
const templateList = ref([...mockTemplates])
const categories = computed(() => mockCategories)
const materials = computed(() => mockMaterials)

const examListDialogVisible = ref(false)
const relatedExams = ref([])

const permissionDialogVisible = ref(false)
const permissionForm = reactive({
  departments: [],
  visibleTo: 'all',
  users: []
})

const templateForm = reactive({
  id: null,
  name: '',
  description: '',
  categories: [],
  difficulty: 'medium',
  questionCount: 20,
  passScore: 60,
  duration: 30,
  materials: [],
  requiredLearning: false,
  createTime: '',
  creator: 'admin'
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  categories: [{ required: true, message: '请选择题目分类', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  questionCount: [{ required: true, message: '请输入题目数量', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }],
  passScore: [{ required: true, message: '请输入及格分数', trigger: 'blur' }]
}

const resetForm = () => {
  Object.assign(templateForm, {
    id: null,
    name: '',
    description: '',
    categories: [],
    difficulty: 'medium',
    questionCount: 20,
    passScore: 60,
    duration: 30,
    createTime: '',
    creator: 'admin'
  })
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogTitle.value = '创建考试模板'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑考试模板'
  Object.assign(templateForm, { ...row })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!templateFormRef.value) return
  await templateFormRef.value.validate((valid) => {
    if (valid) {
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      if (isEdit.value) {
        const index = templateList.value.findIndex(t => t.id === templateForm.id)
        if (index !== -1) {
          templateList.value[index] = { ...templateList.value[index], ...templateForm }
        }
        ElMessage.success('编辑成功')
      } else {
        const newTemplate = {
          ...templateForm,
          id: templateList.value.length + 1,
          createTime: now
        }
        templateList.value.push(newTemplate)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该模板吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = templateList.value.findIndex(t => t.id === row.id)
    if (index !== -1) {
      templateList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleViewExams = (row) => {
  relatedExams.value = mockExams.filter(e => e.templateId === row.id)
  examListDialogVisible.value = true
}

const getMaterialCount = (templateId) => {
  const relation = templateMaterials.find(tm => tm.templateId === templateId)
  return relation ? relation.materialIds.length : 0
}

const getTemplateMaterials = (templateId) => {
  const relation = templateMaterials.find(tm => tm.templateId === templateId)
  if (!relation) return []
  return mockMaterials.filter(m => relation.materialIds.includes(m.id))
}

const handlePermission = (row) => {
  permissionForm.departments = []
  permissionForm.visibleTo = 'all'
  permissionForm.users = []
  permissionDialogVisible.value = true
}

const uploadDialogVisible = ref(false)
const aiDialogVisible = ref(false)
const aiGenerating = ref(false)
const aiGeneratedTemplate = ref(null)
const aiForm = reactive({
  name: '',
  description: '',
  category: '',
  difficulty: 'medium',
  questionCount: 20,
  duration: 30,
  prompt: ''
})

const handleUpload = () => {
  uploadDialogVisible.value = true
}

const handleAIGenerate = () => {
  aiGeneratedTemplate.value = null
  aiForm.prompt = ''
  aiDialogVisible.value = true
}

const generateTemplate = () => {
  if (!aiForm.prompt) {
    ElMessage.warning('请输入生成指令')
    return
  }
  aiGenerating.value = true
  setTimeout(() => {
    aiGeneratedTemplate.value = {
      name: aiForm.name || 'AI生成模板',
      description: aiForm.description || '由AI自动生成的考试模板',
      categories: aiForm.category ? [aiForm.category] : [1],
      difficulty: aiForm.difficulty,
      questionCount: aiForm.questionCount,
      passScore: 60,
      duration: aiForm.duration
    }
    aiGenerating.value = false
    ElMessage.success('AI生成完成')
  }, 2000)
}

const saveGeneratedTemplate = () => {
  if (aiGeneratedTemplate.value) {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    const newTemplate = {
      ...aiGeneratedTemplate.value,
      id: templateList.value.length + 1,
      createTime: now,
      creator: 'admin'
    }
    templateList.value.push(newTemplate)
    ElMessage.success('模板保存成功')
    aiDialogVisible.value = false
  }
}

const handleFileChange = (file) => {
  // 处理文件上传逻辑
  console.log('上传文件:', file)
}

const confirmUpload = () => {
  ElMessage.success('模板上传成功')
  uploadDialogVisible.value = false
}

const savePermission = () => {
  ElMessage.success('权限设置保存成功')
  permissionDialogVisible.value = false
}
</script>
