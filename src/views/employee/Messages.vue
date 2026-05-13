<template>
  <div class="messages-page">
    <div class="messages-header">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="未读" name="unread" />
      </el-tabs>
      <el-button type="primary" link size="small" @click="markAllRead" v-if="unreadCount > 0">
        全部已读
      </el-button>
    </div>

    <div class="messages-list">
      <div 
        v-for="message in filteredMessages" 
        :key="message.id" 
        class="message-item"
        :class="{ unread: !message.isRead }"
        @click="viewMessage(message)"
      >
        <div class="message-icon">
          <el-icon :size="24" :color="getMessageColor(message.type)">
            <component :is="getMessageIcon(message.type)" />
          </el-icon>
        </div>
        <div class="message-content">
          <div class="message-title">{{ message.title }}</div>
          <div class="message-desc">{{ message.content }}</div>
          <div class="message-time">{{ message.time }}</div>
        </div>
        <div v-if="!message.isRead" class="unread-dot"></div>
      </div>

      <el-empty v-if="filteredMessages.length === 0" description="暂无消息" />
    </div>

    <el-dialog v-model="messageDetailVisible" title="消息详情" width="90%" style="max-width: 500px;">
      <div v-if="currentMessage" class="message-detail">
        <h3 style="margin-bottom: 15px;">{{ currentMessage.title }}</h3>
        <div style="color: #666; margin-bottom: 15px;">{{ currentMessage.time }}</div>
        <div style="line-height: 1.8; color: #333;">{{ currentMessage.content }}</div>
        <div v-if="currentMessage.type === 'exam'" style="margin-top: 20px;">
          <el-button type="primary" @click="goToExam">查看考试</el-button>
        </div>
        <div v-if="currentMessage.type === 'points'" style="margin-top: 20px;">
          <el-button type="primary" @click="router.push('/employee/points')">查看积分</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('all')
const messageDetailVisible = ref(false)
const currentMessage = ref(null)

const messages = ref([
  {
    id: 1,
    type: 'exam',
    title: '考试提醒',
    content: '您有一个新的考试"安全生产知识考试"即将开始，请及时参加。考试时间：2024年1月15日 09:00-11:00',
    time: '2024-01-14 10:30',
    isRead: false
  },
  {
    id: 2,
    type: 'points',
    title: '积分变动',
    content: '恭喜您完成"设备操作规程考试"，获得20积分奖励！当前积分：580分',
    time: '2024-01-13 15:20',
    isRead: false
  },
  {
    id: 3,
    type: 'system',
    title: '系统公告',
    content: '系统将于2024年1月20日凌晨2:00-4:00进行维护升级，届时系统将无法访问，请提前做好准备。',
    time: '2024-01-12 09:00',
    isRead: false
  },
  {
    id: 4,
    type: 'exam',
    title: '考试结果通知',
    content: '您参加的"应急处理能力测试"成绩已公布，得分：85分，恭喜通过！',
    time: '2024-01-11 16:45',
    isRead: true
  },
  {
    id: 5,
    type: 'points',
    title: '积分兑换成功',
    content: '您已成功兑换"电影票一张"，消耗100积分。请前往行政部领取。',
    time: '2024-01-10 14:30',
    isRead: true
  }
])

const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length)

const filteredMessages = computed(() => {
  if (activeTab.value === 'unread') {
    return messages.value.filter(m => !m.isRead)
  }
  return messages.value
})

const getMessageIcon = (type) => {
  const icons = {
    exam: 'EditPen',
    points: 'Star',
    system: 'Bell'
  }
  return icons[type] || 'Bell'
}

const getMessageColor = (type) => {
  const colors = {
    exam: '#409EFF',
    points: '#E6A23C',
    system: '#67C23A'
  }
  return colors[type] || '#909399'
}

const viewMessage = (message) => {
  currentMessage.value = message
  message.isRead = true
  messageDetailVisible.value = true
}

const markAllRead = () => {
  messages.value.forEach(m => m.isRead = true)
  ElMessage.success('已全部标记为已读')
}

const goToExam = () => {
  messageDetailVisible.value = false
  router.push('/employee/exam-list')
}
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px;
}

.messages-header {
  background: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.messages-list {
  padding: 10px;
}

.message-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  transition: all 0.3s;
}

.message-item:active {
  background: #f5f5f5;
}

.message-item.unread {
  background: #f0f9ff;
}

.message-icon {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.message-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.unread-dot {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
}

.message-detail {
  padding: 10px 0;
}
</style>
