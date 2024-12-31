<template>
  <div class="blacklist-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>黑名单管理</h3>
          <el-input
            v-model="searchForm.username"
            placeholder="搜索用户名"
            style="width: 200px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="blacklist"
        style="width: 100%"
      >
        <el-table-column label="用户名" prop="username" width="120" />
        
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 0 ? 'danger' : 'warning'">
              {{ row.type === 0 ? '冒领行为' : '多次违规' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="原因" prop="reason" min-width="300" show-overflow-tooltip />
        
        <el-table-column label="加入时间" prop="createTime" width="180" />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="黑名单详情" width="600px">
      <template v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentRecord.username }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentRecord.userId }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentRecord.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentRecord.email || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="currentRecord.type === 0 ? 'danger' : 'warning'">
              {{ currentRecord.type === 0 ? '冒领行为' : '多次违规' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="加入时间">{{ currentRecord.createTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>加入原因</h4>
          <p>{{ currentRecord.reason }}</p>
        </div>

        <div class="detail-section" v-if="currentRecord.type === 0">
          <h4>相关认领申请</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物品名称">{{ currentRecord.claimInfo?.itemName }}</el-descriptions-item>
            <el-descriptions-item label="申请类型">
              {{ currentRecord.claimInfo?.claimType === 'claim' ? '认领申请' : '还回申请' }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRecord.claimInfo?.createTime }}</el-descriptions-item>
            <el-descriptions-item label="处理时间">{{ currentRecord.claimInfo?.handleTime }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const blacklist = ref([])

// 详情对话框相关
const detailVisible = ref(false)
const currentRecord = ref(null)

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
    const data = await request.get('admin/blacklist', { params })
    blacklist.value = data.records
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取黑名单列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetail = async (row) => {
  try {
    const data = await request.get(`admin/blacklist/${row.blacklistId}`)
    currentRecord.value = data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取详情失败')
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

.pagination {
  margin-top: 20px;
  text-align: right;
}

.detail-section {
  margin-top: 20px;

  h4 {
    margin-bottom: 10px;
    color: #606266;
    font-weight: bold;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
}
</style> 