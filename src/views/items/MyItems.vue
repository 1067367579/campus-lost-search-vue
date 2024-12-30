<template>
  <div class="my-items-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>我的物品</h3>
          <div class="header-right">
            <el-button type="primary" @click="$router.push('/publish-item?type=lost')">
              发布丢失物品
            </el-button>
            <el-button type="primary" @click="$router.push('/publish-item?type=found')">
              发布拾取物品
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="物品类型">
            <el-select v-model="searchForm.itemType" placeholder="全部类型" style="width: 150px" clearable>
              <el-option label="丢失物品" :value="0" />
              <el-option label="拾取物品" :value="1" />
            </el-select>
          </el-form-item>

          <el-form-item label="物品类别">
            <el-select v-model="searchForm.categoryId" placeholder="全部类别" style="width: 200px" clearable>
              <el-option v-for="category in categories" :key="category.categoryId" :label="category.name"
                :value="category.categoryId" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" style="width: 150px" clearable>
              <el-option :label="searchForm.itemType === 0 ? '未找到' : '未认领'" :value="0" />
              <el-option :label="searchForm.itemType === 0 ? '已找到' : '已认领'" :value="1" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 物品列表 -->
      <el-table v-loading="loading" :data="itemList" style="width: 100%">
        <el-table-column prop="itemName" label="物品名称" min-width="120" />
        <el-table-column prop="categoryName" label="类别" width="120" />
        <el-table-column label="物品类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.itemType === 0 ? 'danger' : 'success'">
              {{ row.itemType === 0 ? '丢失' : '拾取' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image v-if="row.images && row.images.length > 0" :src="row.images[0]" :preview-src-list="row.images"
              fit="cover" style="width: 50px; height: 50px; cursor: pointer" />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="location" label="地点" min-width="150" />
        <el-table-column :prop="row => row.itemType === 0 ? 'lostTime' : 'foundTime'" label="时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">
              {{ row.status === 0 ? (row.itemType === 0 ? '未找到' : '未认领') : (row.itemType === 0 ? '已找到' : '已认领') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="showDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

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
            <p><strong>类型：</strong>{{ currentItem.itemType === 0 ? '丢失物品' : '拾取物品' }}</p>
            <p><strong>类别：</strong>{{ currentItem.categoryName }}</p>
            <p><strong>描述：</strong>{{ currentItem.description }}</p>
            <p><strong>地点：</strong>{{ currentItem.location }}</p>
            <p><strong>时间：</strong>{{ currentItem.itemType === 0 ? currentItem.lostTime : currentItem.foundTime }}</p>
            <p><strong>状态：</strong>{{ currentItem.status === 0 ? (currentItem.itemType === 0 ? '未找到' : '未认领') : (currentItem.itemType === 0 ? '已找到' : '已认领') }}</p>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const itemList = ref([])
const detailVisible = ref(false)
const currentItem = ref(null)
const categories = ref([])

const searchForm = reactive({
  itemType: '',
  categoryId: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

// 获取物品类别列表
const fetchCategories = async () => {
  try {
    const data = await request.get('category/list')
    categories.value = data
  } catch (error) {
    ElMessage.error('获取物品类别失败')
  }
}

// 获取我的物品列表
const fetchItems = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
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

onMounted(() => {
  fetchCategories()
  fetchItems()
})

const handleSearch = () => {
  currentPage.value = 1
  fetchItems()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    itemType: '',
    categoryId: '',
    status: ''
  })
  handleSearch()
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
.my-items-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 10px;
}

.search-bar {
  margin-bottom: 20px;
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