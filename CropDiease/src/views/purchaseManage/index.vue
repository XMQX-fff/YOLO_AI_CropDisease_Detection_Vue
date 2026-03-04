<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue';
import { usePurchaseApi } from '/@/api/purchase';
import PurchaseDialog from './dialog.vue';

// API
const purchaseApi = usePurchaseApi();

// 页面标题
const pageTitle = ref('农资采购');
const pageDesc = ref('管理农作物生产所需的农资采购信息');

// 对话框引用
const purchaseDialogRef = ref<InstanceType<typeof PurchaseDialog>>();

// 表格数据状态
const state = reactive({
  tableData: {
    data: [] as any[],
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

// 获取表格数据
const getTableData = async () => {
  state.tableData.loading = true;
  try {
    const response = await purchaseApi.getPurchaseList({
      search: state.tableData.param.search,
      supplier: state.tableData.param.supplier,
      region: state.tableData.param.region,
      manager: state.tableData.param.manager,
      pageNum: state.tableData.param.pageNum,
      pageSize: state.tableData.param.pageSize,
    });
    
    if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
      const data = response.data;
      if (data && data.records) {
        state.tableData.data = data.records.map((item: any, index: number) => ({
          ...item,
          num: (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize + index + 1,
        }));
        state.tableData.total = data.total;
      } else {
        state.tableData.data = [];
        state.tableData.total = 0;
      }
    } else {
      ElMessage.error(response.msg || '获取数据失败');
      state.tableData.data = [];
      state.tableData.total = 0;
    }
  } catch (error) {
    console.error('获取采购数据失败:', error);
    ElMessage.error('获取数据失败');
    state.tableData.data = [];
    state.tableData.total = 0;
  } finally {
    state.tableData.loading = false;
  }
};

// 打开新增采购弹窗
const onOpenAddPurchase = () => {
  purchaseDialogRef.value?.openDialog('add');
};

// 打开修改采购弹窗
const onOpenEditPurchase = (row: any) => {
  purchaseDialogRef.value?.openDialog('edit', row);
};

// 删除采购
const onRowDel = (row: any) => {
  ElMessageBox.confirm(`此操作将永久删除采购信息「${row.productName}」，是否继续?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await purchaseApi.deletePurchase(row.id);
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
          ElMessage.success('删除成功！');
          getTableData();
        } else {
          ElMessage.error(response.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 分页大小改变
const onHandleSizeChange = (val: number) => {
  state.tableData.param.pageSize = val;
  state.tableData.param.pageNum = 1;
  getTableData();
};

// 分页页码改变
const onHandleCurrentChange = (val: number) => {
  state.tableData.param.pageNum = val;
  getTableData();
};

// 刷新数据
const onRefresh = () => {
  getTableData();
};

// 页面加载时
onMounted(() => {
  getTableData();
});
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDesc }}</p>
    </div>

    <div class="content-wrapper">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="state.tableData.param" class="search-form">
          <el-form-item label="产品名称">
            <el-input 
              v-model="state.tableData.param.search" 
              placeholder="请输入产品名称" 
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="供货商">
            <el-input 
              v-model="state.tableData.param.supplier" 
              placeholder="请输入供货商" 
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="地区">
            <el-input 
              v-model="state.tableData.param.region" 
              placeholder="请输入地区" 
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="采购人">
            <el-input 
              v-model="state.tableData.param.manager" 
              placeholder="请输入采购人" 
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getTableData()">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="state.tableData.param = { search: '', supplier: '', region: '', manager: '', pageNum: 1, pageSize: 10 }; getTableData()">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-section">
        <el-button type="primary" @click="onOpenAddPurchase">
          <el-icon><Plus /></el-icon>
          新增采购
        </el-button>
        <el-button @click="onRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 表格区域 -->
      <div class="table-section">
        <el-table 
          :data="state.tableData.data" 
          v-loading="state.tableData.loading" 
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="num" label="序号" width="70" align="center" />
          <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip align="center" />
          <el-table-column prop="price" label="价格(元)" width="100" align="center">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: 600;">¥{{ row.price?.toFixed(2) || '0.00' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="采购数量" width="100" align="center" />
          <el-table-column prop="supplier" label="供货商" min-width="120" show-overflow-tooltip align="center" />
          <el-table-column prop="region" label="地区" min-width="100" show-overflow-tooltip align="center" />
          <el-table-column prop="phone" label="电话" width="130" align="center" />
          <el-table-column prop="manager" label="采购人" width="100" align="center" />
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip align="center" />
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="onOpenEditPurchase(row)">
                <el-icon><Edit /></el-icon>
                修改
              </el-button>
              <el-button link type="danger" size="small" @click="onRowDel(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="state.tableData.param.pageNum"
            v-model:page-size="state.tableData.param.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="state.tableData.total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="onHandleSizeChange"
            @current-change="onHandleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 采购对话框 -->
    <PurchaseDialog ref="purchaseDialogRef" @refresh="getTableData" />
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-header {
  padding: 20px 24px;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.page-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.content-wrapper {
  padding: 0 24px 24px;
}

/* 搜索区域 */
.search-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

/* 操作按钮区域 */
.action-section {
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

/* 表格区域 */
.table-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-form {
    display: flex;
    flex-direction: column;
  }
  
  .search-form :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .search-form :deep(.el-form-item__content) {
    width: 100%;
  }
  
  .search-form :deep(.el-input) {
    width: 100% !important;
  }
}
</style>
