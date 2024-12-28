<template>
  <div class="blacklist-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>黑名单管理</h3>
          <el-radio-group v-model="searchForm.type" @change="handleSearch">
            <el-radio-button :label="">全部</el-radio-button>
            <el-radio-button :label="0">冒领</el-radio-button>
            <el-radio-button :label="1">多次违规</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="blacklist"
        style="width: 100%"
      >
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div>
              <p><strong>用户名：</strong>{{ row.username }}</p>
              <p><strong>ID：</strong>{{ row.userId }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 0 ? 'danger' : 'warning'">
              {{ row.type === 0 ? '冒领' : '多次违规' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="原因" min-width="300" show-overflow-tooltip />
        
        <el-table-column prop="createTime" label="加入时间" width="180" />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              title="确定要解除该用户的黑名单状态吗？"
              @confirm="handleRemove(row)"
            >
              <template #reference>
                <el-button type="primary" link>解除</el-button>
              </template>
            </el-popconfirm>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const blacklist = ref([])

const searchForm = reactive({
  type: '',
  pageNum: 1,
  pageSize: 10
})

onMounted(() => {
  fetchBlacklist()
})

const fetchBlacklist = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const data = await request.get('/api/admin/blacklist', { params })
    blacklist.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取黑名单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchBlacklist()
}

const handleRemove = async (row) => {
  try {
    await request.delete(`/api/admin/blacklist/${row.blacklistId}`)
    ElMessage.success('已解除黑名单')
    fetchBlacklist()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchBlacklist()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchBlacklist()
}
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
</style> 