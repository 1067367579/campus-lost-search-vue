<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理认领</span>
              <el-button type="primary" link @click="$router.push('/admin/claims')">
                查看详情
              </el-button>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="pendingStats.pendingClaims">
              <template #title>
                <div class="statistic-title">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>待处理认领申请</span>
                </div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理投诉</span>
              <el-button type="primary" link @click="$router.push('/admin/complaints')">
                查看详情
              </el-button>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="pendingStats.pendingComplaints">
              <template #title>
                <div class="statistic-title">
                  <el-icon>
                    <Warning />
                  </el-icon>
                  <span>待处理投诉</span>
                </div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { Document, Warning } from '@element-plus/icons-vue'

const adminStore = useAdminStore()
const pendingStats = ref({
  pendingComplaints: 0,
  pendingClaims: 0
})

onMounted(async () => {
  await fetchPendingStats()
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
</style>