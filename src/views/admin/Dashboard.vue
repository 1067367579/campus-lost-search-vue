<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理认领</span>
              <el-button 
                type="primary" 
                link 
                @click="$router.push('/admin/claims')"
              >
                查看详情
              </el-button>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="pendingStats.pendingClaims">
              <template #title>
                <div class="statistic-title">
                  <el-icon><Document /></el-icon>
                  <span>待处理认领申请</span>
                </div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理投诉</span>
              <el-button 
                type="primary" 
                link 
                @click="$router.push('/admin/complaints')"
              >
                查看详情
              </el-button>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="pendingStats.pendingComplaints">
              <template #title>
                <div class="statistic-title">
                  <el-icon><Warning /></el-icon>
                  <span>待处理投诉</span>
                </div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>黑名单用户</span>
              <el-button 
                type="primary" 
                link 
                @click="$router.push('/admin/blacklist')"
              >
                查看详情
              </el-button>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="blacklistCount">
              <template #title>
                <div class="statistic-title">
                  <el-icon><CircleClose /></el-icon>
                  <span>黑名单用户数</span>
                </div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近操作日志 -->
    <el-card class="operation-logs" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>最近操作日志</span>
          <el-button 
            type="primary" 
            link 
            @click="$router.push('/admin/operation-logs')"
          >
            查看更多
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="recentLogs"
        style="width: 100%"
      >
        <el-table-column prop="adminName" label="操作人" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="150" />
        <el-table-column prop="operationContent" label="操作内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="createTime" label="操作时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { Document, Warning, CircleClose } from '@element-plus/icons-vue'
import request from '@/utils/request'

const adminStore = useAdminStore()
const loading = ref(false)
const pendingStats = ref({
  pendingComplaints: 0,
  pendingClaims: 0
})
const blacklistCount = ref(0)
const recentLogs = ref([])

onMounted(async () => {
  await Promise.all([
    fetchPendingStats(),
    fetchBlacklistCount(),
    fetchRecentLogs()
  ])
})

// 获取待处理事项统计
const fetchPendingStats = async () => {
  try {
    const data = await adminStore.fetchPendingStats()
    pendingStats.value = data
  } catch (error) {
    console.error('获取待处理统计失败:', error)
  }
}

// 获取黑名单用户数量
const fetchBlacklistCount = async () => {
  try {
    const data = await request.get('/api/admin/blacklist/count')
    blacklistCount.value = data
  } catch (error) {
    console.error('获取黑名单统计失败:', error)
  }
}

// 获取最近操作日志
const fetchRecentLogs = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: 1,
      pageSize: 5
    }
    const data = await request.get('/api/admin/operation-logs', { params })
    recentLogs.value = data.list
  } catch (error) {
    console.error('获取操作日志失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.statistic-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
}

.operation-logs {
  margin-top: 20px;
}

:deep(.el-card__header) {
  padding: 15px 20px;
}

:deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}
</style> 