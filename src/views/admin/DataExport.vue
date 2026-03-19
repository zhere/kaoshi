<template>
  <div class="page-card">
    <div class="page-title">数据导出</div>
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="export-card">
          <div class="export-icon">
            <el-icon :size="48" color="#409EFF"><DataAnalysis /></el-icon>
          </div>
          <h3>统计数据</h3>
          <p>导出考试统计数据，包括参与人数、平均分、通过率等</p>
          <div style="margin-top: 20px;">
            <el-date-picker v-model="statsDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%; margin-bottom: 15px;" />
            <el-button type="primary" style="width: 100%;" @click="exportStats">
              <el-icon><Download /></el-icon>导出统计数据
            </el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="export-card">
          <div class="export-icon">
            <el-icon :size="48" color="#67C23A"><Document /></el-icon>
          </div>
          <h3>答题记录</h3>
          <p>导出员工答题记录，包括考试名称、得分、答题详情等</p>
          <div style="margin-top: 20px;">
            <el-select v-model="selectedExam" placeholder="选择考试" style="width: 100%; margin-bottom: 15px;">
              <el-option label="全部考试" value="" />
              <el-option v-for="exam in exams" :key="exam.id" :label="exam.name" :value="exam.id" />
            </el-select>
            <el-button type="success" style="width: 100%;" @click="exportRecords">
              <el-icon><Download /></el-icon>导出答题记录
            </el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="export-card">
          <div class="export-icon">
            <el-icon :size="48" color="#E6A23C"><Files /></el-icon>
          </div>
          <h3>题目库</h3>
          <p>导出题目库数据，包括题目内容、选项、答案、解析等</p>
          <div style="margin-top: 20px;">
            <el-select v-model="selectedCategory" placeholder="选择分类" style="width: 100%; margin-bottom: 15px;">
              <el-option label="全部分类" value="" />
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
            <el-button type="warning" style="width: 100%;" @click="exportQuestions">
              <el-icon><Download /></el-icon>导出题目库
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="page-card" style="margin-top: 20px;">
      <div class="page-title">导出历史</div>
      <el-table :data="exportHistory" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="type" label="导出类型" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="count" label="数据量" width="100" />
        <el-table-column prop="time" label="导出时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="downloadFile(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { exams as mockExams, categories as mockCategories } from '@/data/mockData'

const statsDateRange = ref([])
const selectedExam = ref('')
const selectedCategory = ref('')
const exams = ref([...mockExams])
const categories = ref([...mockCategories])

const exportHistory = ref([
  { id: 1, type: '统计数据', description: '2024年第一季度统计数据', count: 156, time: '2024-03-15 14:30:00', operator: 'admin' },
  { id: 2, type: '答题记录', description: '安全生产考试答题记录', count: 45, time: '2024-03-14 10:20:00', operator: 'manager1' },
  { id: 3, type: '题目库', description: '电气安全分类题目', count: 30, time: '2024-03-13 16:45:00', operator: 'admin' }
])

const exportStats = () => {
  ElMessage.success('统计数据导出成功，文件已下载')
  exportHistory.value.unshift({
    id: exportHistory.value.length + 1,
    type: '统计数据',
    description: '统计数据导出',
    count: 156,
    time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    operator: 'admin'
  })
}

const exportRecords = () => {
  ElMessage.success('答题记录导出成功，文件已下载')
  exportHistory.value.unshift({
    id: exportHistory.value.length + 1,
    type: '答题记录',
    description: selectedExam.value ? `考试ID: ${selectedExam.value}` : '全部考试答题记录',
    count: 45,
    time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    operator: 'admin'
  })
}

const exportQuestions = () => {
  ElMessage.success('题目库导出成功，文件已下载')
  exportHistory.value.unshift({
    id: exportHistory.value.length + 1,
    type: '题目库',
    description: selectedCategory.value ? `分类ID: ${selectedCategory.value}` : '全部题目',
    count: 30,
    time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    operator: 'admin'
  })
}

const downloadFile = (row) => {
  ElMessage.success(`正在下载：${row.description}`)
}
</script>

<style scoped>
.export-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.export-icon {
  margin-bottom: 20px;
}

.export-card h3 {
  margin: 0 0 10px;
  color: #333;
}

.export-card p {
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>
