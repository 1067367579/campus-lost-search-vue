<template>
  <div class="item-list-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>{{ isLost ? '丢失物品' : '拾取物品' }}</h3>
          <el-button type="primary" @click="$router.push('/publish-item')">
            发布{{ isLost ? '丢失' : '拾取' }}物品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="物品类别">
            <el-select v-model="searchForm.categoryId" placeholder="全部类别" clearable>
              <el-option
                v-for="category in categories"
                :key="category.categoryId"
                :label="category.name"
                :value="category.categoryId"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索物品名称、描述"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 物品列表 -->
      <el-table
        v-loading="loading"
        :data="itemList"
        style="width: 100%"
      >
        <el-table-column prop="itemName" label="物品名称" min-width="120" />
        <el-table-column prop="categoryName" label="类别" width="120" />
        <el-table-column prop="location" label="地点" min-width="150" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">
              {{ row.status === 0 ? '未找到' : '已找到' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="primary"
              link
              @click="handleClaim(row)"
            >
              申请认领
            </el-button>
            <el-button
              type="primary"
              link
              @click="showDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 物品详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentItem?.itemName"
      width="600px"
    >
      <template v-if="currentItem">
        <div class="item-detail">
          <p><strong>类别：</strong>{{ currentItem.categoryName }}</p>
          <p><strong>描述：</strong>{{ currentItem.description }}</p>
          <p><strong>地点：</strong>{{ currentItem.location }}</p>
          <p><strong>时间：</strong>{{ currentItem.time }}</p>
          <p><strong>发布者：</strong>{{ currentItem.publisher?.username }}</p>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { useClaimStore } from '@/stores/claim'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const claimStore = useClaimStore()

const isLost = computed(() => route.name === 'LostItems')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const currentItem = ref(null)

const searchForm = reactive({
  categoryId: '',
  keyword: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const { categories } = itemStore
const itemList = computed(() => isLost.value ? itemStore.lostItems : itemStore.foundItems)

onMounted(async () => {
  if (categories.value.length === 0) {
    await itemStore.fetchCategories()
  }
  fetchItems()
})

const fetchItems = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get(`/api/${isLost.value ? 'lost' : 'found'}-item/list`, { params })
    itemList.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取物品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchItems()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    categoryId: '',
    keyword: '',
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

const handleClaim = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要申请认领该物品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await claimStore.submitClaim({
      itemId: row.itemId,
      itemType: isLost.value ? 0 : 1,
      description: '我是物品的主人'
    })
    
    ElMessage.success('申请提交成功')
    fetchItems()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '申请提交失败')
    }
  }
}
</script>

<style scoped>
.item-list-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style> 