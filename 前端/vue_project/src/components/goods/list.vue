<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <el-row :gutter="20">
        <!--搜索和添加区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addGoodsPage">添加</el-button>
        </el-col>
      </el-row>
      <!--表格区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop label="商品信息"></el-table-column>
        <el-table-column prop label="商品价格"></el-table-column>
        <el-table-column prop label="商品重量"></el-table-column>
        <el-table-column prop label="创建时间"></el-table-column>
        <el-table-column prop label="操作">
          <template>
            <!--编辑-->
            <el-button type="primary" icon="el-icon-edit"></el-button>
            <!--删除-->
            <el-button type="danger" icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表数据的参数对象
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      // 总数据
      total: 0,
      // 商品列表数据
      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      console.log(res.meta.status)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      }
      console.log(res.data)
      this.$message.success('获取商品列表成功!')
      this.goodsList = res.data
    },
    // 点击添加按钮，跳转添加页面
    addGoodsPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
