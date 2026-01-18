<template>
	<div class="system-role-container layout-padding">
		<div class="system-role-padding layout-padding-auto layout-padding-view">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入温室名称" style="max-width: 180px"> </el-input>
				<el-input v-model="state.tableData.param.cropType" size="default" placeholder="请输入作物类型" class="ml10" style="max-width: 180px"> </el-input>
				<el-input v-model="state.tableData.param.growthStatus" size="default" placeholder="请输入生长状态" class="ml10" style="max-width: 180px"> </el-input>
				<el-input v-model="state.tableData.param.manager" size="default" placeholder="请输入负责人" class="ml10" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddGreenhouse('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					添加
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column prop="num" label="序号" width="80" align="center" />
				<el-table-column prop="greenhouseName" label="温室名称" show-overflow-tooltip width="100" align="center" />
				<el-table-column prop="cropType" label="作物类型" show-overflow-tooltip width="100" align="center" />
				<el-table-column prop="quantity" label="数量" width="100" align="center" />
				<el-table-column prop="growthStatus" label="生长状态" show-overflow-tooltip width="100" align="center" />
				<el-table-column prop="temperature" label="温度(℃)" width="100" align="center" />
				<el-table-column prop="airHumidity" label="空气湿度(%)" width="105" align="center" />
				<el-table-column prop="soilHumidity" label="土壤湿度(%)" width="110" align="center" />
				<el-table-column prop="co2Concentration" label="CO2浓度(ppm)" width="120" align="center" />
				<el-table-column prop="soilPh" label="土壤pH" width="80" align="center" />
				<el-table-column prop="lightIntensity" label="光照强度(lux)" width="110" align="center" />
				<!-- <el-table-column prop="supplementaryLight" label="补光状态" width="80" align="center" />
				<el-table-column prop="ventilation" label="通风状态" width="80" align="center" />
				<el-table-column prop="irrigation" label="灌溉状态" width="80" align="center" /> -->
				<el-table-column prop="manager" label="负责人" show-overflow-tooltip width="80" align="center" />
				<el-table-column prop="recordTime" label="记录时间" width="160" align="center" />
				<el-table-column label="操作" width="150" fixed="right" align="center">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onOpenEditGreenhouse('edit', scope.row)">修改</el-button>
						<el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
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
		<GreenhouseDialog ref="greenhouseDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';

// 引入组件
const GreenhouseDialog = defineAsyncComponent(() => import('./dialog.vue'));

// 导入API
import { useGreenhouseApi } from '/@/api/greenhouse';
const greenhouseApi = useGreenhouseApi();

// 定义变量内容
const greenhouseDialogRef = ref();
const state = reactive({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			cropType: '',
			growthStatus: '',
			manager: '',
			recordTime: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

// 获取表格数据
const getTableData = () => {
	state.tableData.loading = true;
	greenhouseApi.getGreenhouseList(state.tableData.param)
		.then((res) => {
			if (res.code == 0) {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				for (let i = 0; i < res.data.records.length; i++) {
					state.tableData.data[i] = res.data.records[i];
					state.tableData.data[i]['num'] = i + 1;
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

// 打开新增温室弹窗
const onOpenAddGreenhouse = (type: string) => {
	greenhouseDialogRef.value.openDialog(type);
};

// 打开修改温室弹窗
const onOpenEditGreenhouse = (type: string, row: Object) => {
	greenhouseDialogRef.value.openDialog(type, row);
};

// 删除温室
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该温室信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			greenhouseApi.deleteGreenhouse(row.id).then((res) => {
				if (res.code == 0) {
					ElMessage({
						type: 'success',
						message: '删除成功！',
					});
					setTimeout(() => {
						getTableData();
					}, 500);
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
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	min-height: 100vh;
	padding: 20px;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

	.system-role-padding {
		padding: 20px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
		}

		.el-table {
			flex: 1;
			background: rgba(255, 255, 255, 0.8);
			border-radius: 12px;
			border: 1px solid rgba(255, 255, 255, 0.3);
			overflow: hidden;

			:deep(.el-table__header-wrapper) {
				.el-table__header {
					th {
						background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
						color: white;
						font-weight: 500;
						border-bottom: none;
						padding: 12px 8px;

						&:first-child {
							border-top-left-radius: 12px;
						}

						&:last-child {
							border-top-right-radius: 12px;
						}
					}
				}
			}

			:deep(.el-table__body-wrapper) {
				.el-table__body {
					tr {
						&:hover {
							background: rgba(72, 187, 120, 0.1);
						}

						td {
							padding: 12px 8px;
							border-bottom: 1px solid rgba(72, 187, 120, 0.1);
							transition: all 0.2s ease;

							&:hover {
								background: rgba(72, 187, 120, 0.15);
							}
						}
					}
				}
			}

			:deep(.el-table__empty-block) {
				background: rgba(255, 255, 255, 0.8);
			}
		}

		.system-user-search {
			display: flex;
			align-items: center;
			gap: 12px;
			margin-bottom: 20px;
			padding: 20px;
			background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(47, 133, 90, 0.1) 100%);
			border-radius: 12px;
			border: 1px solid rgba(72, 187, 120, 0.2);

			.el-input {
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

			.el-button {
				border-radius: 8px;
				transition: all 0.3s ease;
				padding: 8px 16px;

				&--primary {
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					border: none;
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
						background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
					}
				}

				&--success {
					background: linear-gradient(135deg, #38a169 0%, #276749 100%);
					border: none;
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 6px 16px rgba(56, 161, 105, 0.4);
						background: linear-gradient(135deg, #276749 0%, #38a169 100%);
					}
				}
			}
		}

		.mt15 {
			margin-top: 20px;
		}

		:deep(.el-pagination) {
			justify-content: center;
			display: flex;

			.is-background {
				background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
				color: white;
				
				&:hover {
					background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
				}
			}

			.is-active {
				.is-background {
					background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
				}
			}

			.el-pagination__sizes {
				select {
					border-radius: 6px;
					border-color: rgba(72, 187, 120, 0.3);
					
					&:hover {
						border-color: #48bb78;
					}
				}
			}
		}
	}
}
</style>