<template>
  <div class="page-card">
    <div class="page-title">学习资料管理</div>
    <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>上传资料
      </el-button>
      <el-select v-model="filterType" placeholder="资料类型" clearable style="width: 120px;">
        <el-option label="PDF" value="pdf" />
        <el-option label="视频" value="video" />
        <el-option label="图片" value="image" />
        <el-option label="文档" value="doc" />
      </el-select>
      <el-select v-model="filterCategory" placeholder="资料分类" clearable style="width: 150px;">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索资料名称" clearable style="width: 200px;">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>
    <el-table :data="filteredMaterials" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="title" label="资料名称" width="200" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.type === 'pdf' ? 'danger' : row.type === 'video' ? 'warning' : 'info'" size="small">
            {{ row.type === 'pdf' ? 'PDF' : row.type === 'video' ? '视频' : row.type === 'image' ? '图片' : '文档' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          {{ getCategoryName(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="fileSize" label="文件大小" width="100">
        <template #default="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="学习时长" width="100">
        <template #default="{ row }">
          {{ row.duration }}分钟
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" size="small" @click="handlePreview(row)">预览</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <el-form :model="materialForm" :rules="rules" ref="materialFormRef" label-width="100px">
      <el-form-item label="资料名称" prop="title">
        <el-input v-model="materialForm.title" placeholder="请输入资料名称" />
      </el-form-item>
      <el-form-item label="资料描述" prop="description">
        <el-input v-model="materialForm.description" type="textarea" :rows="2" placeholder="请输入资料描述" />
      </el-form-item>
      <el-form-item label="资料类型" prop="type">
        <el-select v-model="materialForm.type" placeholder="请选择资料类型" style="width: 100%">
          <el-option label="PDF文档" value="pdf" />
          <el-option label="视频" value="video" />
          <el-option label="图片" value="image" />
          <el-option label="文档" value="doc" />
        </el-select>
      </el-form-item>
      <el-form-item label="资料分类" prop="category">
        <el-select v-model="materialForm.category" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="上传文件" prop="file">
        <el-upload
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          :file-list="fileList"
          accept=".pdf,.mp4,.avi,.mov,.jpg,.jpeg,.png,.doc,.docx"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持PDF、视频、图片、文档格式</div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="学习时长" prop="duration">
        <el-input-number v-model="materialForm.duration" :min="5" :max="120" />
        <span style="margin-left: 10px;">分钟</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="previewDialogVisible" title="资料预览" width="800px">
    <div v-if="previewMaterial" style="text-align: center;">
      <h3 style="margin-bottom: 20px;">{{ previewMaterial.title }}</h3>
      <div v-if="previewMaterial.type === 'pdf'" style="background: #f5f5f5; padding: 100px; border-radius: 8px;">
        <el-icon :size="64" color="#999"><Document /></el-icon>
        <p style="margin-top: 20px; color: #666;">PDF文档预览区域</p>
      </div>
      <div v-else-if="previewMaterial.type === 'video'" style="background: #000; padding: 50px; border-radius: 8px;">
        <el-icon :size="64" color="#fff"><VideoPlay /></el-icon>
        <p style="margin-top: 20px; color: #fff;">视频播放区域</p>
      </div>
      <div v-else style="background: #f5f5f5; padding: 100px; border-radius: 8px;">
        <el-icon :size="64" color="#999"><Picture /></el-icon>
        <p style="margin-top: 20px; color: #666;">图片预览区域</p>
      </div>
      <div style="margin-top: 20px; text-align: left; padding: 15px; background: #f8f9fa; border-radius: 6px;">
        <p><strong>资料描述：</strong>{{ previewMaterial.description }}</p>
        <p><strong>学习时长：</strong>{{ previewMaterial.duration }}分钟</p>
        <p><strong>文件大小：</strong>{{ formatFileSize(previewMaterial.fileSize) }}</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { materials as mockMaterials, categories as mockCategories } from '@/data/mockData'

const dialogVisible = ref(false)
const dialogTitle = ref('上传资料')
const isEdit = ref(false)
const materialFormRef = ref(null)
const materialList = ref([...mockMaterials])
const categories = computed(() => mockCategories)
const fileList = ref([])

const filterType = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

const previewDialogVisible = ref(false)
const previewMaterial = ref(null)

const materialForm = reactive({
  id: null,
  title: '',
  description: '',
  type: 'pdf',
  category: '',
  url: '',
  fileSize: 0,
  duration: 30,
  createTime: '',
  creator: 'admin'
})

const rules = {
  title: [{ required: true, message: '请输入资料名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择资料类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择资料分类', trigger: 'change' }],
  duration: [{ required: true, message: '请输入学习时长', trigger: 'blur' }]
}

const filteredMaterials = computed(() => {
  return materialList.value.filter(m => {
    if (filterType.value && m.type !== filterType.value) return false
    if (filterCategory.value && m.category !== filterCategory.value) return false
    if (searchKeyword.value && !m.title.includes(searchKeyword.value)) return false
    return true
  })
})

const getCategoryName = (categoryId) => {
  const cat = mockCategories.find(c => c.id === categoryId)
  return cat ? cat.name : ''
}

const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

const resetForm = () => {
  Object.assign(materialForm, {
    id: null,
    title: '',
    description: '',
    type: 'pdf',
    category: '',
    url: '',
    fileSize: 0,
    duration: 30,
    createTime: '',
    creator: 'admin'
  })
  fileList.value = []
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogTitle.value = '上传资料'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑资料'
  Object.assign(materialForm, { ...row })
  dialogVisible.value = true
}

const handleFileChange = (file) => {
  materialForm.fileSize = file.size
  materialForm.url = URL.createObjectURL(file.raw)
}

const handleSubmit = async () => {
  if (!materialFormRef.value) return
  await materialFormRef.value.validate((valid) => {
    if (valid) {
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      if (isEdit.value) {
        const index = materialList.value.findIndex(m => m.id === materialForm.id)
        if (index !== -1) {
          materialList.value[index] = { ...materialList.value[index], ...materialForm }
        }
        ElMessage.success('编辑成功')
      } else {
        const newMaterial = {
          ...materialForm,
          id: materialList.value.length + 1,
          createTime: now
        }
        materialList.value.unshift(newMaterial)
        ElMessage.success('上传成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该资料吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = materialList.value.findIndex(m => m.id === row.id)
    if (index !== -1) {
      materialList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handlePreview = (row) => {
  previewMaterial.value = { ...row }
  previewDialogVisible.value = true
}
</script>
