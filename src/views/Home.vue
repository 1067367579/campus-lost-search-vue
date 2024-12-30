<template>
  <div class="home-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="statistic-card">
            <div class="icon-wrapper lost">
              <el-icon><Search /></el-icon>
            </div>
            <div class="content">
              <div class="title">待寻找物品</div>
              <div class="number">{{ stats.lostItems }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <div class="statistic-card">
            <div class="icon-wrapper found">
              <el-icon><Box /></el-icon>
            </div>
            <div class="content">
              <div class="title">待认领物品</div>
              <div class="number">{{ stats.foundItems }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <div class="statistic-card">
            <div class="icon-wrapper success">
              <el-icon><Check /></el-icon>
            </div>
            <div class="content">
              <div class="title">成功认领</div>
              <div class="number">{{ stats.claimedItems }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/publish-item?type=lost')">
              <el-icon><Search /></el-icon>
              发布丢失物品
            </el-button>
            <el-button type="success" @click="$router.push('/publish-item?type=found')">
              <el-icon><Box /></el-icon>
              发布拾取物品
            </el-button>
            <el-button @click="$router.push('/my-claims')">
              <el-icon><Document /></el-icon>
              我的认领
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新物品</span>
            </div>
          </template>
          <el-table :data="recentItems" style="width: 100%">
            <el-table-column prop="itemName" label="物品名称" />
            <el-table-column prop="type" label="类型">
              <template #default="{ row }">
                {{ row.type === 0 ? '丢失' : '拾取' }}
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发布时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Box, Document, Check } from '@element-plus/icons-vue'
import request from '@/utils/request'

const stats = ref({
  lostItems: 0,
  foundItems: 0,
  claimedItems: 0
})

const recentItems = ref([])

onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchRecentItems()
  ])
})

const fetchStats = async () => {
  try {
    const data = await request.get('stats')
    stats.value = data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRecentItems = async () => {
  try {
    const data = await request.get('recent-items')
    recentItems.value = data
  } catch (error) {
    console.error('获取最近物品失败:', error)
  }
}
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 120px);
}

.statistic-card {
  display: flex;
  align-items: center;
  padding: 10px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.icon-wrapper :deep(.el-icon) {
  font-size: 40px;
  color: #fff;
}

.lost {
  background-color: #409eff;
}

.found {
  background-color: #67c23a;
}

.success {
  background-color: #e6a23c;
}

.content {
  flex: 1;
}

.title {
  font-size: 16px;
  color: #909399;
  margin-bottom: 10px;
}

.number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: 16px;
}
</style> 