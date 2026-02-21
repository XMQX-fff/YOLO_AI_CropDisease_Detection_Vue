<template>
  <div class="purchase-manage-container">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">农资采购</h1>
        <p class="page-subtitle">管理农作物生产所需的农资采购信息</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input v-model="state.tableData.param.search" size="default" placeholder="请输入产品名称" style="max-width: 180px"> </el-input>
        <el-input v-model="state.tableData.param.supplier" size="default" placeholder="请输入供货商" class="ml10" style="max-width: 180px"> </el-input>
        <el-input v-model="state.tableData.param.region" size="default" placeholder="请输入地区" class="ml10" style="max-width: 180px"> </el-input>
        <el-input v-model="state.tableData.param.manager" size="default" placeholder="请输入采购人" class="ml10" style="max-width: 180px"> </el-input>
        <el-button size="default" type="primary" class="ml10" @click="getTableData()">
          <el-icon>
            <el-icon-search />
          </el-icon>
          查询
        </el-button>
        <el-button size="default" type="success" class="ml10" @click="onOpenAddPurchase('add')">
          <el-icon>
            <el-icon-plus />
          </el-icon>
          添加
        </el-button>
      </div>
      
      <!-- 数据表格 -->
      <div class="table-section">
        <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
          <el-table-column prop="num" label="序号" width="80" align="center" />
          <el-table-column prop="productName" label="产品名称" show-overflow-tooltip width="120" align="center" />
          <el-table-column prop="price" label="价格(元)" width="120" align="center" />
          <el-table-column prop="quantity" label="采购数量" width="120" align="center" />
          <el-table-column prop="supplier" label="供货商" show-overflow-tooltip width="120" align="center" />
          <el-table-column prop="region" label="地区" show-overflow-tooltip width="120" align="center" />
          <el-table-column prop="phone" label="电话" show-overflow-tooltip width="150" align="center" />
          <el-table-column prop="manager" label="采购人" show-overflow-tooltip width="120" align="center" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip width="150" align="center" />
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" @click="onOpenEditPurchase('edit', scope.row)">修改</el-button>
              <el-button size="small" type="danger" @click="onRowDel(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          @size-change="onHandleSizeChange"
          @current-change="onHandleCurrentChange"
          class="mt15"
          :pager-count="5"
          :page-sizes="[10, 20, 30]"
          v-model:current-page="state.tableData.param.pageNum"
          background
          v-model:page-size="state.tableData.param.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="state.tableData.total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search as ElIconSearch, Plus as ElIconPlus } from '@element-plus/icons-vue';
import { usePurchaseApi } from '/@/api/purchase';

// 定义变量内容
const purchaseDialogRef = ref();
const purchaseApi = usePurchaseApi();
const state = reactive({
  tableData: {
    data: [] as any,
    total: 0,
    loading: false,
    param: {
      search: '',
      supplier: '',
      region: '',
      manager: '',
      pageNum: 1,
      pageSize: 10,
    },
  },
});

// 使用API获取数据
const getTableData = async () => {
  state.tableData.loading = true;
  try {
    const response = await purchaseApi.getProductList({
      ...state.tableData.param,
      page: state.tableData.param.pageNum,
      limit: state.tableData.param.pageSize
    });
    const data = response.data;
    if (data && data.records) {
      state.tableData.data = data.records.map((item: any, index: number) => ({
        ...item,
        num: (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize + index + 1,
        productName: item.productName,
        price: item.price,
        quantity: 0, // 默认值，实际应从后端获取
        supplier: '', // 默认值，实际应从后端获取
        region: item.region,
        phone: item.phone,
        manager: '', // 默认值，实际应从后端获取
        remark: item.description
      }));
      state.tableData.total = data.total;
    } else {
      state.tableData.data = [];
      state.tableData.total = 0;
      ElMessage({
        type: 'warning',
        message: '未获取到数据',
      });
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取数据失败',
    });
    console.error('获取采购数据失败:', error);
    state.tableData.data = [];
    state.tableData.total = 0;
  } finally {
    state.tableData.loading = false;
  }
};

// 打开新增采购弹窗
const onOpenAddPurchase = async (type: string) => {
  try {
    // 这里可以打开添加采购的表单
    ElMessage({
      type: 'info',
      message: '添加采购信息功能开发中',
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '操作失败',
    });
  }
};

// 打开修改采购弹窗
const onOpenEditPurchase = async (type: string, row: any) => {
  try {
    // 这里可以打开修改采购的表单
    ElMessage({
      type: 'info',
      message: '修改采购信息功能开发中',
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '操作失败',
    });
  }
};

// 删除采购
const onRowDel = async (row: any) => {
  ElMessageBox.confirm(`此操作将永久删除该采购信息，是否继续?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await purchaseApi.deleteProduct(row.id);
        ElMessage({
          type: 'success',
          message: '删除成功！',
        });
        getTableData();
      } catch (error) {
        ElMessage({
          type: 'error',
          message: '删除失败',
        });
      }
    })
    .catch(() => {});
};

// 分页改变
const onHandleSizeChange = (val: number) => {
  state.tableData.param.pageSize = val;
  getTableData();
};

// 分页改变
const onHandleCurrentChange = (val: number) => {
  state.tableData.param.pageNum = val;
  getTableData();
};

// 页面加载时
onMounted(() => {
  getTableData();
});
</script>

<style scoped>
.purchase-manage-container {
  padding: 24px;
  background-color: #ffffff;
  min-height: calc(100vh - 120px);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.search-section {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.table-section {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ml10 {
  margin-left: 10px;
}

.mt15 {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 表格样式调整 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  th {
    background-color: #f3f4f6;
    font-weight: 500;
    color: #374151;
  }
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9fafb;
  }
}

/* 按钮样式调整 */
:deep(.el-button) {
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 12px;
}

:deep(.el-button--primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
  
  &:hover {
    background-color: #2563eb;
    border-color: #2563eb;
  }
}

:deep(.el-button--success) {
  background-color: #10b981;
  border-color: #10b981;
  
  &:hover {
    background-color: #059669;
    border-color: #059669;
  }
}

:deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;
  
  &:hover {
    background-color: #dc2626;
    border-color: #dc2626;
  }
}

/* 输入框样式调整 */
:deep(.el-input) {
  border-radius: 6px;
  
  & .el-input__wrapper {
    border-radius: 6px;
  }
}

/* 分页样式调整 */
:deep(.el-pagination) {
  .el-pager li {
    border-radius: 4px;
    
    &.active {
      background-color: #3b82f6;
      color: #ffffff;
    }
  }
  
  .btn-prev,
  .btn-next {
    border-radius: 4px;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section .el-input {
    width: 100% !important;
    max-width: none !important;
  }
  
  .ml10 {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .search-section .el-button {
    width: 100%;
    margin-top: 10px;
  }
}
</style>