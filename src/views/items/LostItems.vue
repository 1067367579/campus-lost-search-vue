<template>
  <div class="lost-items-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>丢失物品</h3>
          <el-button type="primary" @click="$router.push('/publish-item?type=lost')">
            发布丢失物品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="物品类别">
            <el-select 
              v-model="searchForm.categoryId" 
              placeholder="全部类别" 
              style="width: 200px" 
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="category in categories"
                :key="category.categoryId"
                :label="category.name"
                :value="category.categoryId"
                :disabled="category.status === 0"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索物品名称、描述"
              clearable
              @input="handleSearch"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>

          <el-form-item label="状态">
            <el-select 
              v-model="searchForm.status" 
              placeholder="全部状态" 
              style="width: 200px" 
              clearable
              @change="handleSearch"
            >
              <el-option label="未找到" :value="0" />
              <el-option label="已找到" :value="1" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 物品列表 -->
      <div class="items-grid">
        <el-card v-for="item in itemList" :key="item.itemId" class="item-card">
          <!-- 物品图片 -->
          <div class="item-image">
            <el-image 
              v-if="item.images?.length" 
              :src="item.images[0]"
              :preview-src-list="item.images"
              fit="cover"
            />
            <el-empty v-else description="暂无图片" />
          </div>

          <!-- 物品信息 -->
          <div class="item-info">
            <h3 class="item-name">{{ item.itemName }}</h3>
            <div class="item-meta">
              <el-tag size="small">{{ item.categoryName }}</el-tag>
              <el-tag 
                :type="item.status === 0 ? 'warning' : 'success'"
                size="small"
              >
                {{ item.status === 0 ? '未找到' : '已找到' }}
              </el-tag>
            </div>
            <p class="item-desc">{{ item.description }}</p>
            <p class="item-location">
              <el-icon><Location /></el-icon>
              {{ item.location }}
            </p>
            <p class="item-time">
              <el-icon><Timer /></el-icon>
              {{ item.lostTime }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="item-actions">
            <el-button 
              v-if="item.username === userStore.userInfo?.username"
              type="primary" 
              link 
              @click="handleEdit(item)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="item.status === 0" 
              type="primary" 
              link 
              @click="handleReturn(item)"
            >
              提交还回
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="showDetail(item)"
            >
              查看详情
            </el-button>
          </div>
        </el-card>
      </div>

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
            <p><strong>类别：</strong>{{ currentItem.categoryName }}</p>
            <p><strong>描述：</strong>{{ currentItem.description }}</p>
            <p><strong>地点：</strong>{{ currentItem.location }}</p>
            <p><strong>丢失时间：</strong>{{ currentItem.lostTime }}</p>
            <p><strong>发布者：</strong>{{ currentItem.username }}</p>
            <p><strong>联系手机号：</strong>{{ currentItem.phone }}</p>
            <p><strong>联系邮箱：</strong>{{ currentItem.email }}</p>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 还回申请对话框 -->
    <el-dialog v-model="returnVisible" title="提交还回申请" width="500px">
      <el-form ref="returnFormRef" :model="returnForm" :rules="returnRules" label-width="100px">
        <el-form-item label="还回说明" prop="description">
          <el-input
            v-model="returnForm.description"
            type="textarea"
            :rows="4"
            placeholder="请描述如何找到物品，以及与失主的联系情况"
          />
        </el-form-item>

        <el-form-item label="联系记录" prop="evidence">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            :http-request="handleUpload"
            list-type="picture-card"
            :limit="1"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip">
            请上传与失主的联系记录截图，作为还回证明
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="returnVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReturn">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { useClaimStore } from '@/stores/claim'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const itemStore = useItemStore()
const claimStore = useClaimStore()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const itemList = ref([])
const detailVisible = ref(false)
const returnVisible = ref(false)
const currentItem = ref(null)
const returnFormRef = ref(null)
const userStore = useUserStore()

const searchForm = reactive({
  categoryId: '',
  keyword: '',
  status: 0,
  pageNum: 1,
  pageSize: 10
})

const returnForm = ref({
  description: '',
  evidence: ''
})

const returnRules = {
  description: [
    { required: true, message: '请输入还回说明', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const categories = ref([])

// 获取物品类别列表
const fetchCategories = async () => {
  try {
    const data = await request.get('category/list')
    categories.value = data
  } catch (error) {
    ElMessage.error('获取物品类别失败')
  }
}

onMounted(() => {
  fetchCategories()
  handleSearch()  // 获取物品列表
})

const fetchItems = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('lost-item/list', { params })
    itemList.value = data.records
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

const handleReturn = (row) => {
  currentItem.value = row
  returnVisible.value = true
}

const submitReturn = async () => {
  if (!returnFormRef.value) return
  
  await returnFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('claim', {
          itemId: currentItem.value.itemId,
          itemType: 0, // 丢失物品
          description: returnForm.value.description,
          evidence: returnForm.value.evidence, // 联系记录图片URL
          claimType: 'return' // 标记为还回申请
        })
        ElMessage.success('还回申请提交成功')
        returnVisible.value = false
        returnFormRef.value.resetFields()
      } catch (error) {
        ElMessage.error(error.message || '申请提交失败')
      }
    }
  })
}

// 处理图片上传
const handleUpload = async (options) => {
  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', options.file)
    
    const data = await request.post('upload/image', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  
    returnForm.value.evidence = data.url
    options.onSuccess()
  } catch (error) {
    options.onError()
    ElMessage.error('图片上传失败')
  }
}

const handleEdit = (row) => {
  router.push(`/edit-item/${row.itemId}?type=0`)
}
</script>

<style scoped>
.lost-items-container {
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

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.el-carousel {
  margin-bottom: 20px;
}

:deep(.el-carousel__indicators) {
  transform: translateY(20px);
}

:deep(.el-image-viewer__wrapper) {
  z-index: 2050;
  /* 确保图片预览在对话框之上 */
}

.detail-info {
  margin-top: 20px;

  p {
    margin: 10px 0;
  }
}

/* 添加网格布局样式 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.item-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.item-image {
  height: 160px;
  overflow: hidden;
  border-radius: 4px;
  
  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }
}

.item-info {
  flex: 1;
  padding: 12px 0;
}

.item-name {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.item-desc {
  color: #666;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-location,
.item-time {
  color: #999;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 5px;
}

.item-actions {
  border-top: 1px solid #eee;
  padding-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .item-image {
    height: 160px;
  }
}
</style>