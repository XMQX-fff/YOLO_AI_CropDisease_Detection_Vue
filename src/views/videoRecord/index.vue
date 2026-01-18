<template>
	<div class="system-role-container layout-padding">
		<div class="system-role-padding layout-padding-auto layout-padding-view">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search1" size="default" placeholder="请输入农作物类型" style="max-width: 180px"> </el-input>
				<!-- <el-input v-model="state.tableData.param.search3" size="default" placeholder="请输入最低阈值" style="max-width: 180px; margin-left: 15px"></el-input> -->
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column prop="num" label="序号" width="100" align="center" />
				<el-table-column prop="inputVideo" label="原视频" width="200" align="center">
					<template #default="scope">
						<video class="video" controls :key="scope.row.inputVideo + uniqueKey" style="max-height: 80px;">
							<source :src="scope.row.inputVideo" type="video/mp4" />
						</video>
					</template>
				</el-table-column>
				<el-table-column prop="outVideo" label="处理结果" width="200" align="center">
					<template #default="scope">
						<video class="video" preload="auto" controls :key="scope.row.outVideo + uniqueKey" style="max-height: 80px;">
							<source :src="scope.row.outVideo" type="video/mp4" />
						</video>
					</template>
				</el-table-column>
				<el-table-column prop="kind" label="农作物种类" align="center" width="110"/>
				<el-table-column prop="weight" label="识别权重" align="center" width="110"/>
				<el-table-column prop="conf" label="最小阈值" show-overflow-tooltip width="110" align="center"></el-table-column>
				<el-table-column prop="username" label="识别用户" show-overflow-tooltip align="center" width="110"></el-table-column>
				<el-table-column prop="startTime" label="识别时间" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column label="操作" width="130" align="center">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
						<el-button size="small" text type="primary" @click="show(scope.row)">查看详情</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="onHandleSizeChange" @current-change="onHandleCurrentChange" class="mt15"
				:pager-count="5" :page-sizes="[10, 20, 30]" v-model:current-page="state.tableData.param.pageNum"
				background v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="state.tableData.total">
			</el-pagination>
		</div>
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import { useRecordApi } from '/@/api/record';

const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);
const recordApi = useRecordApi();

const state = reactive<SysRoleState>({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			search3: '',
			search2: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

// 唯一标识符，动态刷新
const uniqueKey = ref(0);

const getTableData = () => {
	state.tableData.loading = true;
	if (userInfos.value.userName != 'admin') {
		state.tableData.param.search = userInfos.value.userName;
	}
	recordApi.getVideoRecordList(state.tableData.param)
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

				// 更新唯一标识符
				uniqueKey.value++;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
};

const show = (row: any) => {
	window.open('http://localhost:8100/#/videoShow?id=' + row.id);
};

const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			recordApi.deleteVideoRecord(row.id).then((res) => {
				if (res.code == 0) {
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

const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};

const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

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
				height: 100px;
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
					
					&:first-child {
						border-top-left-radius: 12px;
					}
					
					&:last-child {
						border-top-right-radius: 12px;
					}
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

		.system-user-search {
			display: flex;
			align-items: center;
			gap: 12px;
			margin-bottom: 20px;
			padding: 20px;
			background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(47, 133, 90, 0.1) 100%);
			border-radius: 12px;
			border: 1px solid rgba(72, 187, 120, 0.2);

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
				background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
				border: none;
				
				&:hover {
					transform: translateY(-2px);
					box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
					background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
				}
			}
		}

		.mt15 {
			margin-top: 20px;
		}

		:deep(.el-pagination) {
			justify-content: center;
			display: flex;
			margin-top: 20px;

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

.video {
	width: 100%;
	max-height: 80px;
	height: auto;
	object-fit: contain;
	border-radius: 8px;
	transition: all 0.3s ease;
	box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
	
	&:hover {
		transform: scale(1.02);
		box-shadow: 0 6px 16px rgba(72, 187, 120, 0.3);
	}
}

.mb15 {
	margin-bottom: 20px;
}
</style>
