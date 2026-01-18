<template>
	<div class="system-role-container layout-padding">
		<div class="system-role-padding layout-padding-auto layout-padding-view">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入用户名" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddRole('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					添加
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column prop="num" label="序号" width="80" align="center" />
				<el-table-column prop="username" label="账号" show-overflow-tooltip width="100" align="center"></el-table-column>
				<el-table-column prop="password" label="密码" width="100" align="center" />
				<el-table-column prop="name" label="姓名" show-overflow-tooltip width="100" align="center"></el-table-column>
				<el-table-column prop="sex" label="性别" show-overflow-tooltip width="80" align="center"></el-table-column>
				<el-table-column prop="email" label="邮箱" align="center" />
				<el-table-column prop="tel" label="手机号码" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column prop="role" label="角色" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column prop="avatar" label="头像" align="center">
					<template #default="scope">
						<img :src="scope.row.avatar" width="70" height="70" />
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180" fixed="right" align="center">
					<template #default="scope">
						<el-button size="small" type="primary" @click="onOpenEditRole('edit', scope.row)">修改</el-button>
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
		<RoleDialog ref="roleDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';

// 引入组件
const RoleDialog = defineAsyncComponent(() => import('./dialog.vue'));

// 导入API
import { useUserApi } from '/@/api/user';
const userApi = useUserApi();

// 定义变量内容
const roleDialogRef = ref();
const state = reactive<SysRoleState>({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

const getTableData = () => {
	state.tableData.loading = true;
	userApi.getUserList(state.tableData.param)
		.then((res) => {
			if (res.code == 0) {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				for (let i = 0; i < res.data.records.length; i++) {
					state.tableData.data[i] = res.data.records[i];
					state.tableData.data[i]['num'] = i + 1;
					if (state.tableData.data[i]['role'] == 'admin') {
						state.tableData.data[i]['role'] = '管理员';
					} else if (state.tableData.data[i]['role'] == 'common') {
						state.tableData.data[i]['role'] = '普通用户';
					} else if (state.tableData.data[i]['role'] == 'others') {
						state.tableData.data[i]['role'] = '其他用户';
					}
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

// 打开新增角色弹窗
const onOpenAddRole = (type: string) => {
	roleDialogRef.value.openDialog(type);
};
// 打开修改角色弹窗
const onOpenEditRole = (type: string, row: Object) => {
	roleDialogRef.value.openDialog(type, row);
};

// 删除角色
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			console.log(row);
			userApi.deleteUser(row.id).then((res) => {
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
				height: 80px;
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
			
			:deep(.cell img) {
				width: 50px;  // 调整图片大小
				height: 50px;
				object-fit: cover;
				border-radius: 50%;
				transition: all 0.3s ease;
				box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
				
				&:hover {
					transform: scale(1.1);
					box-shadow: 0 6px 16px rgba(72, 187, 120, 0.3);
				}
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
