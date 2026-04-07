<template>
  <div class="category-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>分类管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加分类
        </el-button>
      </div>
    </div>

    <!-- 分类列表 -->
    <el-card>
      <el-table
        :data="categoryList"
        v-loading="loading"
        stripe
        border
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column label="分类名称" min-width="200">
          <template #default="{ row }">
            <div class="category-name-cell">
              <img v-if="row.icon" :src="row.icon" class="category-icon" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">
            {{ row.sortOrder }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isShow"
              :active-text="'显示'"
              :inactive-text="'隐藏'"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleAddSub(row)">
              <el-icon><Plus /></el-icon>添加子分类
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="上级分类" v-if="!isEdit || formData.parentId !== 0">
          <el-cascader
            v-model="formData.parentId"
            :options="categoryOptions"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }"
            placeholder="请选择上级分类（不选则为顶级分类）"
            style="width: 100%"
            clearable
          />
        </el-form-item>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="分类图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称（如：Goods）" />
        </el-form-item>

        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="显示状态">
          <el-switch
            v-model="formData.isShow"
            :active-text="'显示'"
            :inactive-text="'隐藏'"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { getCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '/@/api/purchase';

// 分类列表
const categoryList = ref([]);
const loading = ref(false);

// 对话框
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const submitLoading = ref(false);

const formData = reactive({
  id: null,
  parentId: null,
  name: '',
  icon: '',
  sortOrder: 0,
  isShow: true
});

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// 转换分类数据为级联选择器格式
const convertToTree = (data, parentId = 0) => {
  return data
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: convertToTree(data, item.id)
    }));
};

// 分类选项（用于级联选择器）
const categoryOptions = computed(() => {
  const tree = convertToTree(categoryList.value);
  return [{ id: 0, name: '顶级分类', children: tree }, ...tree];
});

// 加载分类列表
const loadCategories = async () => {
  loading.value = true;
  try {
    const res = await getCategories();
    if (res.code === 200) {
      categoryList.value = convertToTree(res.data);
    }
  } catch (error) {
    console.error('加载分类列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 添加子分类
const handleAddSub = (row) => {
  isEdit.value = false;
  resetForm();
  formData.parentId = row.id;
  dialogVisible.value = true;
};

// 编辑分类
const handleEdit = (row) => {
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id,
    parentId: row.parentId === 0 ? null : row.parentId,
    name: row.name,
    icon: row.icon,
    sortOrder: row.sortOrder,
    isShow: row.isShow
  });
  dialogVisible.value = true;
};

// 删除分类
const handleDelete = (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该分类下有子分类，请先删除子分类');
    return;
  }

  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCategory(row.id);
      if (res.code === 200) {
        ElMessage.success('删除成功');
        loadCategories();
      }
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};

// 状态变更
const handleStatusChange = async (row, val) => {
  try {
    const res = await toggleCategoryStatus(row.id, val);
    if (res.code === 200) {
      ElMessage.success(val ? '已显示' : '已隐藏');
    }
  } catch (error) {
    ElMessage.error('操作失败');
    row.isShow = !val;
  }
};

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  submitLoading.value = true;
  try {
    const parentId = Array.isArray(formData.parentId)
      ? formData.parentId[formData.parentId.length - 1]
      : (formData.parentId || 0);

    const data = {
      ...formData,
      parentId
    };

    const res = isEdit.value
      ? await updateCategory(formData.id, data)
      : await addCategory(data);

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      loadCategories();
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    parentId: null,
    name: '',
    icon: '',
    sortOrder: 0,
    isShow: true
  });
};

// 生命周期
onMounted(() => {
  loadCategories();
});
</script>

<style scoped lang="scss">
.category-manage-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
  }
}

.category-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    font-size: 18px;
    color: #409eff;
  }

  .category-icon {
    width: 24px;
    height: 24px;
    object-fit: cover;
    border-radius: 4px;
  }
}
</style>
