<template>
  <div>
    <div class="page-card">
      <div class="page-title">学习资料</div>
      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <el-select v-model="filterExam" placeholder="按考试筛选" clearable style="width: 200px;">
          <el-option v-for="exam in examList" :key="exam.id" :label="exam.name" :value="exam.id" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="学习状态" clearable style="width: 120px;">
          <el-option label="未开始" value="not_started" />
          <el-option label="学习中" value="learning" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </div>

      <div v-if="filteredMaterials.length === 0" style="text-align: center; padding: 40px; color: #999;">
        暂无学习资料
      </div>

      <div v-else>
        <div v-for="group in groupedMaterials" :key="group.examId" style="margin-bottom: 30px;">
          <div style="margin-bottom: 15px; padding: 10px 15px; background: #f0f7ff; border-radius: 6px; border-left: 4px solid #409EFF;">
            <h4 style="margin: 0; color: #409EFF;">📚 为《{{ group.examName }}》准备</h4>
            <div style="margin-top: 8px; font-size: 13px; color: #666;">
              <span>考试时间：{{ group.examTime }}</span>
              <span style="margin-left: 20px;">学习进度：{{ group.completedCount }}/{{ group.materials.length }}</span>
              <el-progress :percentage="group.progress" :stroke-width="8" style="margin-top: 8px;" />
            </div>
          </div>
          
          <el-row :gutter="15">
            <el-col :span="8" v-for="material in group.materials" :key="material.id">
              <div class="material-card" @click="handleStudy(material)">
                <div class="material-header">
                  <el-tag :type="material.type === 'pdf' ? 'danger' : material.type === 'video' ? 'warning' : 'info'" size="small">
                    {{ material.type === 'pdf' ? 'PDF' : material.type === 'video' ? '视频' : '图片' }}
                  </el-tag>
                  <el-tag v-if="material.status === 'completed'" type="success" size="small">已完成</el-tag>
                  <el-tag v-else-if="material.status === 'learning'" type="warning" size="small">学习中</el-tag>
                  <el-tag v-else type="info" size="small">未开始</el-tag>
                </div>
                <h4 style="margin: 10px 0; font-size: 15px;">{{ material.title }}</h4>
                <p style="color: #666; font-size: 13px; margin-bottom: 10px;">{{ material.description }}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; color: #999; font-size: 12px;">
                  <span><el-icon><Clock /></el-icon> {{ material.duration }}分钟</span>
                  <span v-if="material.status === 'learning'">进度: {{ material.progress }}%</span>
                </div>
                <el-progress v-if="material.status === 'learning'" :percentage="material.progress" :stroke-width="4" style="margin-top: 8px;" />
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <el-dialog v-model="studyDialogVisible" :title="currentMaterial?.title" width="800px">
      <div v-if="currentMaterial" style="text-align: center;">
        <div v-if="currentMaterial.type === 'pdf'" style="background: #f5f5f5; padding: 150px; border-radius: 8px;">
          <el-icon :size="64" color="#999"><Document /></el-icon>
          <p style="margin-top: 20px; color: #666;">PDF文档学习区域</p>
        </div>
        <div v-else-if="currentMaterial.type === 'video'" style="background: #000; padding: 80px; border-radius: 8px;">
          <el-icon :size="64" color="#fff"><VideoPlay /></el-icon>
          <p style="margin-top: 20px; color: #fff;">视频播放区域</p>
        </div>
        <div v-else style="background: #f5f5f5; padding: 150px; border-radius: 8px;">
          <el-icon :size="64" color="#999"><Picture /></el-icon>
          <p style="margin-top: 20px; color: #666;">图片学习区域</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; text-align: left;">
          <p><strong>资料描述：</strong>{{ currentMaterial.description }}</p>
          <p><strong>学习时长：</strong>{{ currentMaterial.duration }}分钟</p>
          <p><strong>积分奖励：</strong><span style="color: #67C23A; font-weight: bold;">+10积分</span></p>
        </div>
      </div>
      <template #footer>
        <el-button @click="studyDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="completeStudy">完成学习</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { materials, templateMaterials, userMaterials, exams, examTemplates } from '@/data/mockData'

const router = useRouter()
const userStore = useUserStore()
const studyDialogVisible = ref(false)
const currentMaterial = ref(null)

const filterExam = ref('')
const filterStatus = ref('')

const examList = computed(() => exams.value || exams)

const materialsWithStatus = computed(() => {
  const userId = userStore.user?.id
  const userMaterialRecords = userMaterials.filter(um => um.userId === userId)
  
  return materials.map(m => {
    const record = userMaterialRecords.find(um => um.materialId === m.id)
    return {
      ...m,
      status: record?.status || 'not_started',
      progress: record?.progress || 0
    }
  })
})

const groupedMaterials = computed(() => {
  const groups = []
  const filteredExamIds = filterExam.value ? [filterExam.value] : exams.map(e => e.id)
  
  exams.forEach(exam => {
    if (!filteredExamIds.includes(exam.id)) return
    
    const template = examTemplates.find(t => t.id === exam.templateId)
    if (!template) return
    
    const templateMaterial = templateMaterials.find(tm => tm.templateId === template.id)
    if (!templateMaterial) return
    
    const examMaterials = materialsWithStatus.value.filter(m => templateMaterial.materialIds.includes(m.id))
    
    let filtered = examMaterials
    if (filterStatus.value) {
      filtered = examMaterials.filter(m => m.status === filterStatus.value)
    }
    
    if (filtered.length > 0) {
      const completedCount = examMaterials.filter(m => m.status === 'completed').length
      groups.push({
        examId: exam.id,
        examName: exam.name,
        examTime: `${exam.startTime} 至 ${exam.endTime}`,
        materials: filtered,
        completedCount,
        progress: Math.round((completedCount / examMaterials.length) * 100)
      })
    }
  })
  
  return groups
})

const filteredMaterials = computed(() => {
  return groupedMaterials.value.flatMap(g => g.materials)
})

const handleStudy = (material) => {
  currentMaterial.value = { ...material }
  studyDialogVisible.value = true
}

const completeStudy = () => {
  ElMessage.success('学习完成，获得10积分！')
  studyDialogVisible.value = false
}
</script>

<style scoped>
.material-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.material-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
