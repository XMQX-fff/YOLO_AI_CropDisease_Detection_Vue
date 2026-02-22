<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 页面标题
const pageTitle = ref('数据分析')
const pageDesc = ref('分析温室环境数据、作物生长数据和病虫害数据，提供决策支持')

onMounted(() => {
  console.log('数据分析页面加载成功')
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDesc }}</p>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="placeholder">
          <h3>数据分析页面开发中...</h3>
          <p>该功能正在开发中，敬请期待！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background-color: #fff;
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
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
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.card-body {
  padding: 40px 20px;
}

.placeholder {
  text-align: center;
  padding: 60px 20px;
}

.placeholder h3 {
  font-size: 24px;
  color: #666;
  margin-bottom: 16px;
}

.placeholder p {
  font-size: 16px;
  color: #999;
}
</style>
