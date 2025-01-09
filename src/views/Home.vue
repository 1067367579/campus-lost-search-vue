<template>
  <div class="home-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card 
          shadow="hover" 
          class="statistic-card"
          @click="$router.push('/lost-items')"
          style="cursor: pointer"
        >
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

      <el-col :span="12">
        <el-card 
          shadow="hover" 
          class="statistic-card"
          @click="$router.push('/found-items')"
          style="cursor: pointer"
        >
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
    </el-row>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 左侧：快捷操作和我的物品 -->
      <el-col :span="12">
        <!-- 快捷操作 -->
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

        <!-- 我的物品列表 -->
        <el-card style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <h3>我的物品</h3>
            </div>
          </template>

          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="丢失物品" name="lost">
              <el-table v-loading="loading" :data="itemList" style="width: 100%">
                <el-table-column prop="itemName" label="物品名称" min-width="120" />
                <el-table-column prop="categoryName" label="类别" width="100" />
                <el-table-column label="图片" width="80">
                  <template #default="{ row }">
                    <el-image v-if="row.images?.length" :src="row.images[0]" fit="cover"
                      style="width: 40px; height: 40px; cursor: pointer" :preview-src-list="row.images" />
                    <span v-else>无图片</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 0 ? 'warning' : 'success'">
                      {{ row.status === 0 ? '未找到' : '已找到' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                    <el-button type="primary" link @click="showDetail(row)">详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="拾取物品" name="found">
              <el-table v-loading="loading" :data="itemList" style="width: 100%">
                <el-table-column prop="itemName" label="物品名称" min-width="120" />
                <el-table-column prop="categoryName" label="类别" width="100" />
                <el-table-column label="图片" width="80">
                  <template #default="{ row }">
                    <el-image v-if="row.images?.length" :src="row.images[0]" fit="cover"
                      style="width: 40px; height: 40px; cursor: pointer" :preview-src-list="row.images" />
                    <span v-else>无图片</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 0 ? 'warning' : 'success'">
                      {{ row.status === 0 ? '未认领' : '已认领' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                    <el-button type="primary" link @click="showDetail(row)">详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
              :page-sizes="[5, 10, 20]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：最新物品 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新物品</span>
            </div>
          </template>
          <el-table :data="recentItems" style="width: 100%">
            <el-table-column prop="itemName" label="物品名称" min-width="120" />
            <el-table-column prop="categoryName" label="类别" width="100" />
            <el-table-column label="图片" width="80">
              <template #default="{ row }">
                <el-image v-if="row.images?.length" :src="row.images[0]" fit="cover"
                  style="width: 40px; height: 40px; cursor: pointer" :preview-src-list="row.images" />
                <span v-else>无图片</span>
              </template>
            </el-table-column>
            <el-table-column prop="itemType" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.itemType === 0 ? 'danger' : 'success'">
                  {{ row.itemType === 0 ? '丢失' : '拾取' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="showDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 物品详情对话框 -->
    <el-dialog v-model="detailVisible" :title="currentItem?.itemName" width="800px">
      <template v-if="currentItem">
        <div class="item-detail">
          <!-- 图片轮播 -->
          <el-carousel v-if="currentItem.images?.length" height="400px" indicator-position="outside">
            <el-carousel-item v-for="url in currentItem.images" :key="url">
              <el-image :src="url" fit="contain" style="width: 100%; height: 100%"
                :preview-src-list="currentItem.images" />
            </el-carousel-item>
          </el-carousel>

          <div class="detail-info">
            <p><strong>类别：</strong>{{ currentItem.categoryName }}</p>
            <p><strong>描述：</strong>{{ currentItem.description }}</p>
            <p><strong>地点：</strong>{{ currentItem.location }}</p>
            <p><strong>时间：</strong>{{ currentItem.itemType === 0 ? currentItem.lostTime : currentItem.foundTime }}</p>
            <p><strong>状态：</strong>{{ currentItem.status === 0 ? (currentItem.itemType === 0 ? '未找到' : '未认领') :
              (currentItem.itemType === 0 ? '已找到' : '已认领') }}</p>
            <p><strong>联系邮箱：</strong>{{ currentItem.email }}</p>
            <p><strong>联系电话：</strong>{{ currentItem.phone }}</p>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Box, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

// 统计数据
const stats = ref({
  lostItems: 0,
  foundItems: 0
})

const recentItems = ref([])

// 我的物品列表相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const itemList = ref([])
const detailVisible = ref(false)
const currentItem = ref(null)
const activeTab = ref('lost')

onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchRecentItems(),
    fetchItems()
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
    const params = {
      pageNum: 1,
      pageSize: 8
    }
    const data = await request.get('recent-items', { params })
    recentItems.value = data.records
  } catch (error) {
    console.error('获取最近物品失败:', error)
  }
}

// 获取我的物品列表
const fetchItems = async () => {
  loading.value = true
  try {
    const params = {
      itemType: activeTab.value === 'lost' ? 0 : 1,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('item/my-items', { params })
    itemList.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取物品列表失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  currentPage.value = 1
  fetchItems()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchItems()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchItems()
}

const showDetail = (row) => {
  currentItem.value = row
  detailVisible.value = true
}

const handleEdit = (row) => {
  router.push(`/edit-item/${row.itemId}?type=${row.itemType}`)
}
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 120px);
  padding: 20px;
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

.pagination {
  margin-top: 20px;
  text-align: right;
}

.item-detail {
  p {
    margin: 10px 0;
  }
}

.el-carousel {
  margin-bottom: 20px;
}

:deep(.el-carousel__indicators) {
  transform: translateY(20px);
}

:deep(.el-image-viewer__wrapper) {
  z-index: 2050;
}

.detail-info {
  margin-top: 20px;

  p {
    margin: 10px 0;
  }
}
</style>