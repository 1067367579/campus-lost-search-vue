<template>
  <div class="blacklist-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>黑名单管理</h3>
          <div class="header-right">
            <el-form :inline="true" :model="searchForm">
              <el-form-item label="关键词">
                <el-input
                  v-model="searchForm.keyword"
                  placeholder="搜索用户名/学号"
                  clearable
                  @input="handleSearch"
                  @keyup.enter="handleSearch"
                  @clear="handleSearch"
                />
              </el-form-item>

              <el-form-item>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </template>

      <!-- 黑名单列表 -->
      <el-table v-loading="loading" :data="blacklist" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column label="违规类型" width="120">
          <template #default="{ row }">
            {{ row.type === 0 ? '冒领物品' : '多次违规' }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="加入时间" width="180" />
        <el-table-column prop="operatorName" label="操作人" width="120" />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">
              查看详情
            </el-button>
            <el-button type="success" link @click="handleRemove(row)">
              解除黑名单
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="600px">
      <template v-if="currentUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag type="danger">已冻结</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="blacklist-info">
          <h4>黑名单信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="违规类型">
              {{ currentUser.type === 0 ? '冒领物品' : '多次违规' }}
            </el-descriptions-item>
            <el-descriptions-item label="原因说明">
              {{ currentUser.reason }}
            </el-descriptions-item>
            <el-descriptions-item label="加入时间">
              {{ currentUser.blacklistCreateTime }}
            </el-descriptions-item>
            <el-descriptions-item label="操作人">
              {{ currentUser.operatorName }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const blacklist = ref([])
const detailVisible = ref(false)
const currentUser = ref(null)

// 搜索表单
const searchForm = reactive({
  username: '',
  pageNum: 1,
  pageSize: 10
})

// 获取黑名单列表
const fetchBlacklist = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const response = await request.get('admin/blacklist', { params })
    console.log(response)
    blacklist.value = response.records
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取黑名单列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetail = async (row) => {
  try {
    const response = await request.get(`admin/blacklist/${row.blacklistId}`)
    currentUser.value = response
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取用户详情失败')
  }
}

// 解除黑名单
const handleRemove = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要解除该用户的黑名单状态吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await request.post(`admin/users/${row.userId}/unlock`)
    ElMessage.success('操作成功')
    fetchBlacklist()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchBlacklist()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchBlacklist()
}

// 搜索相关
const handleSearch = () => {
  currentPage.value = 1
  fetchBlacklist()
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.pageNum = 1
  searchForm.pageSize = 10
  fetchBlacklist()
}

onMounted(() => {
  fetchBlacklist()
})
</script>

<style scoped>
.blacklist-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 16px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.blacklist-info {
  margin-top: 20px;

  h4 {
    margin: 10px 0;
    color: #606266;
    font-weight: bold;
  }
}
</style> 