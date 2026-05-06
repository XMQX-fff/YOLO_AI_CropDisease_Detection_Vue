<template>
  <div class="img-record-container">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">图像预测记录</h1>
        <p class="page-subtitle">查看和管理图像预测历史记录</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input v-model="state.tableData.param.search1" size="default" placeholder="请输入农作物类型" style="width: 180px"> </el-input>
        <!-- <el-input v-model="state.tableData.param.search2" size="default" placeholder="请输入识别结果" style="width: 180px; margin-left: 16px">
        </el-input> -->
        <el-button size="default" type="primary" class="ml10" @click="getTableData()">
          <el-icon>
            <eleSearch />
          </el-icon>
          查询
        </el-button>
      </div>
      
      <!-- 数据表格 -->
      <div class="table-section">
        <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
          <el-table-column type="expand">
            <template #default="props">
              <div class="expand-content">
                <p class="expand-title">详细识别结果：</p>
                <el-table :data="props.row.family">
                  <el-table-column prop="label" label="识别结果" align="center" />
                  <el-table-column prop="confidence" label="置信度" show-overflow-tooltip align="center"></el-table-column>
                  <el-table-column prop="startTime" label="识别时间" align="center" />
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="num" label="序号" width="80" align="center" />
          <el-table-column prop="inputImg" label="原始图片" width="120" align="center">
            <template #default="scope">
              <img :src="scope.row.inputImg" width="120" height="60" />
            </template>
          </el-table-column>
          <el-table-column prop="outImg" label="预测图片" width="120" align="center">
            <template #default="scope">
              <img :src="scope.row.outImg" width="120" height="60" />
            </template>
          </el-table-column>
          <el-table-column prop="cropType" label="农作物种类" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column prop="weight" label="识别权重" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column prop="conf" label="最小阈值" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column prop="allTime" label="总用时" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column prop="startTime" label="识别时间" width="200" align="center" />
          <el-table-column prop="username" label="识别用户" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column label="操作" width="100" fixed="right" align="center">
            <template #default="scope">
              <el-button size="small" type="danger" @click="onRowDel(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination @size-change="onHandleSizeChange" @current-change="onHandleCurrentChange" class="mt15"
          :pager-count="5" :page-sizes="[10, 20, 30]" v-model:current-page="state.tableData.param.pageNum"
          background v-model:page-size="state.tableData.param.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="state.tableData.total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="systemRole">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useRecordApi } from '/@/api/record';
import { Search as eleSearch } from '@element-plus/icons-vue';

const recordApi = useRecordApi();

const state = reactive({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			search1: '',
			search2: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

const getTableData = () => {
	state.tableData.loading = true;
	recordApi.getImgRecordList(state.tableData.param)
		.then((res) => {
			if (res.code == 0 || res.code == 200 || res.code == '200') {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				for (let i = 0; i < res.data.records.length; i++) {
					let confidences = [];
					let labels = [];
					try {
						confidences = JSON.parse(res.data.records[i].confidence);
					} catch (e) {
						confidences = [res.data.records[i].confidence];
					}
					try {
						labels = JSON.parse(res.data.records[i].label);
					} catch (e) {
						labels = [res.data.records[i].label];
					}
					const transformedData = transformData(res.data.records[i], confidences, labels);
					transformedData["num"] = i + 1;
					state.tableData.data[i] = transformedData
				}
				state.tableData.total = res.data.total;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
};

const transformData = (originalData, confidences, labels) => {
    const family = labels.map((label, index) => ({
        label: label,
        confidence: confidences[index],
        startTime: originalData.startTime
    }));

    const result = {
        id: originalData.id,
        inputImg: originalData.inputImg,
        outImg: originalData.outImg,
        cropType: originalData.kind || '-',  // 使用后端返回的kind字段
        weight: originalData.weight,
        allTime: originalData.allTime,
        conf: originalData.conf,
        startTime: originalData.startTime,
        username: originalData.username,
        family: family
    };

    return result;
}


// 删除
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			console.log(row);
			recordApi.deleteImgRecord(row.id).then((res) => {
				if (res.code == 0) {
					console.log(res.data);
					ElMessage({
						type: 'success',
						message: '删除成功！',
					});
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
			});
			setTimeout(() => {
				getTableData();
			}, 500);
		})
		.catch(() => { });
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
.img-record-container {
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
  gap: 10px;
}

.table-section {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.expand-content {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin: 12px 0;
}

.expand-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

/* 图片样式 */
img {
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
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

:deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;
  
  &:hover {
    background-color: #dc2626;
    border-color: #dc2626;
  }
}

/* 输入框和选择器样式调整 */
:deep(.el-input),
:deep(.el-select) {
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

/* 展开行的样式 */
:deep(.el-table__expanded-cell) {
  padding: 16px !important;
  background-color: #f9fafb;
  
  .el-table {
    margin-top: 12px;
    border-radius: 8px;
    overflow: hidden;
    
    .el-table__header-wrapper {
      background-color: #f3f4f6;
      
      th {
        padding: 8px 0;
        font-weight: 500;
        color: #374151;
      }
    }
    
    .el-table__body-wrapper .el-table__row {
      height: 48px !important;
      
      &:hover {
        background-color: #f3f4f6;
      }
    }
  }
}
</style>