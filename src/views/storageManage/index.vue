<template>
	<div class="system-role-container layout-padding">
		<div class="system-role-padding layout-padding-auto layout-padding-view">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入产品名称" style="max-width: 180px"> </el-input>
				<el-input v-model="state.tableData.param.warehouse" size="default" placeholder="请输入仓库" class="ml10" style="max-width: 180px"> </el-input>
				<el-input v-model="state.tableData.param.storageArea" size="default" placeholder="请输入存储区" class="ml10" style="max-width: 180px"> </el-input>
				<el-input v-model="state.tableData.param.manager" size="default" placeholder="请输入仓库管理员" class="ml10" style="max-width: 180px"> </el-input>
				<!-- <el-input v-model="state.tableData.param.phone" size="default" placeholder="请输入手机号" class="ml10" style="max-width: 180px"> </el-input> -->
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddStorage('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					添加
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column prop="id" label="ID" width="80" align="center" />
				<el-table-column prop="product" label="产品" show-overflow-tooltip width="125" align="center" />
				<el-table-column prop="warehouse" label="用途" show-overflow-tooltip width="180" align="center" />
				<el-table-column prop="storageArea" label="存储区" show-overflow-tooltip width="125" align="center" />
				<el-table-column prop="quantity" label="数量" width="125" align="center" />
				<el-table-column prop="manager" label="仓库管理员" show-overflow-tooltip width="125" align="center" />
				<el-table-column prop="phone" label="手机号" show-overflow-tooltip width="150" align="center" />
				<el-table-column prop="remark" label="备注" show-overflow-tooltip width="180" align="center" />
				<el-table-column label="操作" width="180" fixed="right" align="center">
					<template #default="scope">
						<el-button size="small" type="primary" @click="onOpenEditStorage('edit', scope.row)">修改</el-button>
						<el-button size="small" type="danger" @click="onRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
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
		<StorageDialog ref="storageDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';

// 引入组件
const StorageDialog = defineAsyncComponent(() => import('./dialog.vue'));

// 导入API
import { useStorageApi } from '/@/api/storage';
const storageApi = useStorageApi();

// 定义变量内容
const storageDialogRef = ref();
const state = reactive({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			warehouse: '',
			storageArea: '',
			manager: '',
			phone: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

// 获取表格数据
const getTableData = () => {
	state.tableData.loading = true;
	storageApi.getStorageList(state.tableData.param)
		.then((res) => {
			if (res.code == 0) {
				state.tableData.data = res.data.records;
				state.tableData.total = res.data.total;
				state.tableData.loading = false;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
};

// 打开新增库存弹窗
const onOpenAddStorage = (type: string) => {
	storageDialogRef.value.openDialog(type);
};

// 打开修改库存弹窗
const onOpenEditStorage = (type: string, row: Object) => {
	storageDialogRef.value.openDialog(type, row);
};

// 删除库存
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该库存信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			storageApi.deleteStorage(row.id).then((res) => {
				if (res.code == 0) {
					ElMessage({
						type: 'success',
						message: '删除成功！',
					});
					getTableData();
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
			});
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

<style scoped lang="scss">
.system-role-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	padding: 20px;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

	.system-role-padding {
		padding: 20px;
		min-height: calc(100vh - 40px);
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(72, 187, 120, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(72, 187, 120, 0.2);
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 12px 48px rgba(72, 187, 120, 0.3);
		}

		.el-table {
			flex: 1;
			background: rgba(255, 255, 255, 0.9);
			border-radius: 12px;
			border: 1px solid rgba(72, 187, 120, 0.2);
			overflow: hidden;
			
			:deep(.el-table__row) {
				height: 60px;
				transition: all 0.3s ease;
				
				&:hover {
					background: rgba(72, 187, 120, 0.1);
				}
			}
			
			:deep(.el-table__header) {
				th {
					padding: 10px 0;
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					color: white;
					font-weight: 600;
					border-bottom: none;
				}
			}
			
			:deep(.el-table__cell) {
				padding: 8px 0;
				border-bottom: 1px solid rgba(72, 187, 120, 0.1);
			}
			
			:deep(.cell) {
				line-height: 1.5;
			}
		}
		
		:deep(.el-input) {
			height: 40px;
			line-height: 40px;
			max-width: 180px;
			
			:deep(.el-input__wrapper) {
				border-radius: 8px;
				transition: all 0.3s ease;
				
				&:hover {
					box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
					border-color: rgba(72, 187, 120, 0.4);
				}
				
				&.is-focus {
					border-color: #48bb78;
					box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
				}
			}
		}
		
		:deep(.el-button) {
			border-radius: 8px;
			transition: all 0.3s ease;
			padding: 8px 16px;
		}
		
		:deep(.el-button--primary) {
			background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
			border: none;
			
			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 16px rgba(49, 130, 206, 0.4);
				background: linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%);
			}
		}
		
		:deep(.el-button--danger) {
			background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
			border: none;
			
			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 16px rgba(229, 62, 62, 0.4);
				background: linear-gradient(135deg, #c53030 0%, #e53e3e 100%);
			}
		}
		
		:deep(.el-button--text) {
			color: #48bb78;
			
			&:hover {
				color: #2f855a;
				background: rgba(72, 187, 120, 0.1);
			}
		}
		
		:deep(.el-pagination) {
			.el-pagination__sizes .el-input .el-input__wrapper {
				border-radius: 8px;
			}
			
			.el-pager li {
				border-radius: 4px;
				transition: all 0.3s ease;
				
				&:hover {
					background: rgba(72, 187, 120, 0.1);
				}
				
				&.active {
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					color: white;
				}
			}
			
			.btn-prev,
			.btn-next {
				border-radius: 4px;
				transition: all 0.3s ease;
				
				&:hover {
					background: rgba(72, 187, 120, 0.1);
				}
			}
		}
	}
}

// 搜索区域样式
.system-user-search {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 20px;
	padding: 20px;
	background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(47, 133, 90, 0.1) 100%);
	border-radius: 12px;
	border: 1px solid rgba(72, 187, 120, 0.2);
	flex-wrap: wrap;

	:deep(.el-input) {
		height: 40px;
		line-height: 40px;
		max-width: 180px;
		
		:deep(.el-input__wrapper) {
			border-radius: 8px;
			transition: all 0.3s ease;
			
			&:hover {
				box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
				border-color: rgba(72, 187, 120, 0.4);
			}
			
			&.is-focus {
				border-color: #48bb78;
				box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
			}
		}
	}

	:deep(.el-button) {
		border-radius: 8px;
		transition: all 0.3s ease;
		padding: 8px 16px;
	}
	
	:deep(.el-button--primary),
	:deep(.el-button--success) {
		background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
		border: none;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
			background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
		}
	}
}

.mb15 {
	margin-bottom: 20px;
}

.ml10 {
	margin-left: 15px;
}

.mt15 {
	margin-top: 20px;
}
</style> 