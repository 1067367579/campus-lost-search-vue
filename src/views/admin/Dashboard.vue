<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="icon-wrapper primary">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="label">总用户数</div>
              <div class="number">{{ stats.totalUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="icon-wrapper success">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="label">待完成物品数</div>
              <div class="number">{{ stats.totalItems }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card warning">
          <div class="stat-content">
            <div class="icon-wrapper warning">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="label">待处理申请</div>
              <div class="number">{{ stats.pendingClaims }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card danger">
          <div class="stat-content">
            <div class="icon-wrapper danger">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="label">待处理投诉</div>
              <div class="number">{{ stats.pendingComplaints }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日数据 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>今日数据</h3>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="新增物品">{{ stats.todayNewItems }}</el-descriptions-item>
            <el-descriptions-item label="新增申请">{{ stats.todayNewClaims }}</el-descriptions-item>
            <el-descriptions-item label="新增投诉">{{ stats.todayNewComplaints }}</el-descriptions-item>
            <el-descriptions-item label="黑名单用户">{{ stats.blacklistUsers }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>快捷操作</h3>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/admin/claims')">
              <el-icon><Document /></el-icon>
              处理认领申请
            </el-button>
            <el-button type="warning" @click="$router.push('/admin/complaints')">
              <el-icon><Warning /></el-icon>
              处理投诉
            </el-button>
            <el-button type="success" @click="$router.push('/admin/categories')">
              <el-icon><Menu /></el-icon>
              物品类别管理
            </el-button>
            <el-button type="danger" @click="$router.push('/admin/blacklist')">
              <el-icon><CircleClose /></el-icon>
              黑名单管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近操作日志 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <h3>最近操作日志</h3>
          <el-button text @click="$router.push('/admin/operation-logs')">
            查看更多
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>

      <el-table :data="recentLogs" style="width: 100%">
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="150" />
        <el-table-column prop="operationContent" label="操作内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="createTime" label="操作时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import {
  User,
  Box,
  Timer,
  Warning,
  Document,
  Menu,
  CircleClose,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const stats = ref({
  totalUsers: 0,
  totalItems: 0,
  pendingClaims: 0,
  pendingComplaints: 0,
  blacklistUsers: 0,
  todayNewItems: 0,
  todayNewClaims: 0,
  todayNewComplaints: 0
})
const recentLogs = ref([])

// 获取统计数据
const fetchStats = async () => {
  try {
    const data = await request.get('admin/dashboard/stats')
    stats.value = data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近操作日志
const fetchRecentLogs = async () => {
  try {
    const data = await request.get('admin/operation-logs', {
      params: {
        pageNum: 1,
        pageSize: 5
      }
    })
    recentLogs.value = data.records
  } catch (error) {
    console.error('获取操作日志失败:', error)
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentLogs()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    :deep(.el-icon) {
      font-size: 24px;
      color: white;
    }

    &.primary {
      background-color: var(--el-color-primary);
    }
    &.success {
      background-color: var(--el-color-success);
    }
    &.warning {
      background-color: var(--el-color-warning);
    }
    &.danger {
      background-color: var(--el-color-danger);
    }
  }

  .stat-info {
    .label {
      font-size: 14px;
      color: #909399;
    }
    .number {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      margin-top: 4px;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .el-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}
</style>