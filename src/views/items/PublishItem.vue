<template>
  <div class="publish-container">
    <el-card>
      <template #header>
        <div class="header">
          <h3>{{ isLost ? '发布丢失物品' : '发布拾取物品' }}</h3>
          <el-switch
            v-model="isLost"
            :active-text="'丢失物品'"
            :inactive-text="'拾取物品'"
          />
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="物品名称" prop="itemName">
          <el-input v-model="formData.itemName" placeholder="请输入物品名称" />
        </el-form-item>

        <el-form-item label="物品类别" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择物品类别" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.categoryId"
              :label="category.name"
              :value="category.categoryId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述物品的特征、状态等信息"
          />
        </el-form-item>

        <el-form-item label="地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入丢失/拾取地点" />
        </el-form-item>

        <el-form-item :label="isLost ? '丢失时间' : '拾取时间'" prop="time">
          <el-date-picker
            v-model="formData.time"
            type="datetime"
            :placeholder="`请选择${isLost ? '丢失' : '拾取'}时间`"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">发布</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { ElMessage } from 'element-plus'

const router = useRouter()
const itemStore = useItemStore()
const formRef = ref(null)
const isLost = ref(true)

const formData = reactive({
  itemName: '',
  categoryId: '',
  description: '',
  location: '',
  time: ''
})

const rules = {
  itemName: [
    { required: true, message: '请输入物品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择物品类别', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入详细描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入地点', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请选择时间', trigger: 'change' }
  ]
}

const { categories } = itemStore

onMounted(async () => {
  if (categories.value.length === 0) {
    await itemStore.fetchCategories()
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          ...formData,
          [isLost.value ? 'lostTime' : 'foundTime']: formData.time
        }
        delete submitData.time

        if (isLost.value) {
          await itemStore.publishLostItem(submitData)
        } else {
          await itemStore.publishFoundItem(submitData)
        }

        ElMessage.success('发布成功')
        router.push(isLost.value ? '/lost-items' : '/found-items')
      } catch (error) {
        ElMessage.error(error.message || '发布失败')
      }
    }
  })
}
</script>

<style scoped>
.publish-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 