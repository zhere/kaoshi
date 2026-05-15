<template>
  <div class="page-card">
    <div class="page-title">题目管理</div>
    <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加题目
      </el-button>
      <el-button type="success" @click="handleImport">
        <el-icon><Upload /></el-icon>导入题目
      </el-button>
      <el-button @click="handleDownloadTemplate">
        <el-icon><Download /></el-icon>下载模板
      </el-button>
      <el-button type="warning" @click="handleAIGenerate">
        <el-icon><MagicStick /></el-icon>AI生成考题
      </el-button>
      <el-select v-model="filterCategory" placeholder="题目分类" clearable style="width: 150px;">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-select v-model="filterType" placeholder="题目类型" clearable style="width: 120px;">
        <el-option label="单选题" value="single" />
        <el-option label="多选题" value="multiple" />
        <el-option label="判断题" value="judge" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索题目内容" clearable style="width: 200px;">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>
    <el-table :data="filteredQuestions" border stripe max-height="500">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.type === 'single' ? '' : row.type === 'multiple' ? 'success' : 'warning'" size="small">
            {{ row.type === 'single' ? '单选' : row.type === 'multiple' ? '多选' : '判断' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          {{ getCategoryName(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
      <el-table-column prop="answer" label="答案" width="80" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px; text-align: right;">
      <el-pagination background layout="total, prev, pager, next" :total="filteredQuestions.length" :page-size="10" />
    </div>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
    <el-form :model="questionForm" :rules="rules" ref="questionFormRef" label-width="100px">
      <el-form-item label="题目类型" prop="type">
        <el-select v-model="questionForm.type" placeholder="请选择题目类型" style="width: 100%" @change="handleTypeChange">
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="判断题" value="judge" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目分类" prop="category">
        <el-select v-model="questionForm.category" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目内容" prop="content">
        <el-input v-model="questionForm.content" type="textarea" :rows="3" placeholder="请输入题目内容" />
      </el-form-item>
      <el-form-item label="选项" prop="options">
        <div v-for="(option, index) in questionForm.options" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
          <span style="width: 30px; line-height: 32px;">{{ optionLabels[index] }}.</span>
          <el-input v-model="questionForm.options[index]" :placeholder="'选项' + optionLabels[index]" style="flex: 1;" />
          <el-button v-if="questionForm.type !== 'judge' && questionForm.options.length > 2" type="danger" @click="removeOption(index)">删除</el-button>
        </div>
        <el-button v-if="questionForm.type !== 'judge' && questionForm.options.length < 6" type="primary" link @click="addOption">+ 添加选项</el-button>
      </el-form-item>
      <el-form-item label="正确答案" prop="answer">
        <el-select v-model="questionForm.answer" placeholder="请选择正确答案" style="width: 100%" :multiple="questionForm.type === 'multiple'">
          <el-option v-for="(option, index) in questionForm.options" :key="index" :label="optionLabels[index]" :value="optionLabels[index]" />
        </el-select>
      </el-form-item>
      <el-form-item label="答案解析" prop="analysis">
        <el-input v-model="questionForm.analysis" type="textarea" :rows="2" placeholder="请输入答案解析" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="importDialogVisible" title="导入题目" width="500px">
    <el-upload drag action="#" :auto-upload="false" :on-change="handleFileChange" accept=".xlsx,.xls,.csv">
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">支持 Excel、CSV 格式，请先下载模板</div>
      </template>
    </el-upload>
    <div v-if="importResult" style="margin-top: 20px;">
      <el-alert :title="importResult.title" :type="importResult.type" :description="importResult.description" show-icon />
    </div>
    <template #footer>
      <el-button @click="importDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmImport" :disabled="!importFile">确认导入</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="aiDialogVisible" title="AI自动生成考题" width="600px">
    <div class="ai-generate-dialog">
      <el-form :model="aiForm" label-width="100px">
        <el-form-item label="题目分类">
          <el-select v-model="aiForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目类型">
          <el-select v-model="aiForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目数量">
          <el-input-number v-model="aiForm.count" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="生成指令">
          <el-input v-model="aiForm.prompt" type="textarea" :rows="3" placeholder="请输入生成指令，如：生成关于电气安全操作的选择题" />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="generateQuestions" :loading="aiGenerating" style="width: 100%;">
        <el-icon><MagicStick /></el-icon>开始生成
      </el-button>
      <div v-if="aiGeneratedQuestions.length > 0" class="ai-generated-questions">
        <h4 style="margin: 20px 0 10px;">生成的题目：</h4>
        <div v-for="(q, index) in aiGeneratedQuestions" :key="index" class="question-item" style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 10px;">{{ index + 1 }}. {{ q.content }}</div>
          <div v-for="(opt, i) in q.options" :key="i" style="padding: 5px 0; padding-left: 20px;">
            {{ optionLabels[i] }}. {{ opt }}
          </div>
          <div style="margin-top: 10px; color: #67c23a;">正确答案：{{ q.answer }}</div>
        </div>
        <el-button type="success" @click="saveGeneratedQuestions" style="width: 100%;">保存全部题目</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { questions as mockQuestions, categories as mockCategories } from '@/data/mockData'

const dialogVisible = ref(false)
const dialogTitle = ref('添加题目')
const isEdit = ref(false)
const questionFormRef = ref(null)
const questionList = ref([...mockQuestions])
const categories = computed(() => mockCategories)

const filterCategory = ref('')
const filterType = ref('')
const searchKeyword = ref('')

const importDialogVisible = ref(false)
const importFile = ref(null)
const importResult = ref(null)

const aiDialogVisible = ref(false)
const aiGenerating = ref(false)
const aiGeneratedQuestions = ref([])
const aiForm = reactive({
  category: '',
  type: 'single',
  count: 5,
  prompt: ''
})

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

const questionForm = reactive({
  id: null,
  type: 'single',
  category: '',
  content: '',
  options: ['', '', '', ''],
  answer: '',
  analysis: '',
  createTime: ''
})

const rules = {
  type: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择题目分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  answer: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
}

const filteredQuestions = computed(() => {
  return questionList.value.filter(q => {
    if (filterCategory.value && q.category !== filterCategory.value) return false
    if (filterType.value && q.type !== filterType.value) return false
    if (searchKeyword.value && !q.content.includes(searchKeyword.value)) return false
    return true
  })
})

const getCategoryName = (categoryId) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? cat.name : ''
}

const resetForm = () => {
  Object.assign(questionForm, {
    id: null,
    type: 'single',
    category: '',
    content: '',
    options: ['', '', '', ''],
    answer: '',
    analysis: '',
    createTime: ''
  })
}

const handleTypeChange = () => {
  if (questionForm.type === 'judge') {
    questionForm.options = ['正确', '错误']
    questionForm.answer = ''
  } else {
    questionForm.options = ['', '', '', '']
    questionForm.answer = questionForm.type === 'multiple' ? [] : ''
  }
}

const addOption = () => {
  if (questionForm.options.length < 6) {
    questionForm.options.push('')
  }
}

const removeOption = (index) => {
  questionForm.options.splice(index, 1)
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogTitle.value = '添加题目'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑题目'
  Object.assign(questionForm, {
    ...row,
    answer: row.type === 'multiple' ? row.answer.split('') : row.answer
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!questionFormRef.value) return
  await questionFormRef.value.validate((valid) => {
    if (valid) {
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      if (isEdit.value) {
        const index = questionList.value.findIndex(q => q.id === questionForm.id)
        if (index !== -1) {
          questionList.value[index] = {
            ...questionList.value[index],
            ...questionForm,
            answer: Array.isArray(questionForm.answer) ? questionForm.answer.join('') : questionForm.answer
          }
        }
        ElMessage.success('编辑成功')
      } else {
        const newQuestion = {
          ...questionForm,
          id: questionList.value.length + 1,
          answer: Array.isArray(questionForm.answer) ? questionForm.answer.join('') : questionForm.answer,
          createTime: now
        }
        questionList.value.unshift(newQuestion)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = questionList.value.findIndex(q => q.id === row.id)
    if (index !== -1) {
      questionList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleImport = () => {
  importResult.value = null
  importFile.value = null
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  importFile.value = file.raw
}

const confirmImport = () => {
  importResult.value = {
    title: '导入成功',
    type: 'success',
    description: '成功导入 15 道题目，其中 0 道题目格式有误被跳过'
  }
  setTimeout(() => {
    ElMessage.success('导入完成')
    importDialogVisible.value = false
  }, 1500)
}

const handleDownloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/题目模板.csv'
  link.download = '题目导入模板.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('模板下载成功')
}

const handleAIGenerate = () => {
  aiGeneratedQuestions.value = []
  aiForm.prompt = ''
  aiDialogVisible.value = true
}

const generateQuestions = () => {
  if (!aiForm.prompt) {
    ElMessage.warning('请输入生成指令')
    return
  }
  aiGenerating.value = true
  setTimeout(() => {
    aiGeneratedQuestions.value = [
      {
        content: 'AI生成：在电力生产工作中，安全第一的原则是指（）。',
        type: aiForm.type,
        category: aiForm.category,
        options: ['生产第一，安全第二', '安全第一，预防为主', '效益第一，安全第二', '进度第一，安全第二'],
        answer: 'B',
        analysis: '安全第一，预防为主是电力生产的基本方针。'
      },
      {
        content: 'AI生成：电力企业安全生产责任制应当包括（）。',
        type: aiForm.type,
        category: aiForm.category,
        options: ['主要负责人职责', '分管负责人职责', '安全管理人员职责', '从业人员职责'],
        answer: aiForm.type === 'multiple' ? 'ABCD' : 'A',
        analysis: '安全生产责任制应覆盖各级各类人员。'
      }
    ]
    aiGenerating.value = false
    ElMessage.success('AI生成完成')
  }, 2000)
}

const saveGeneratedQuestions = () => {
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  aiGeneratedQuestions.value.forEach((q, index) => {
    questionList.value.unshift({
      ...q,
      id: questionList.value.length + index + 1,
      createTime: now
    })
  })
  ElMessage.success(`成功保存 ${aiGeneratedQuestions.value.length} 道题目`)
  aiDialogVisible.value = false
}
</script>