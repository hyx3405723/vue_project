<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--搜索区域-->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--表格区域-->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="150">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editOrder"></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location-outline"
              @click="showProgerssBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 25]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!---编辑对话框-->
    <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" @close="addClosed">
      <!--表单区域-->
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="100px">
        <el-form-item label="省市区/县" prop="city">
          <!--级联选择器-->
          <el-cascader
            v-model="addFrom.city"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="addFrom.address"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!---查看物流对话框-->
    <el-dialog title="物流查看" :visible.sync="progressDialogVisible" width="50%" @close="addClosed">
      <!--时间线-->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progerssInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data() {
    return {
      // 获取order数据的参数列表
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 10
      },
      // 总数据的条数
      total: 0,
      // 订单列表数据
      orderList: [],
      // 控制编辑对话框的显示与隐藏
      addressDialogVisible: false,
      // 编辑对话框的表单对象
      addFrom: {
        city: [],
        address: ''
      },
      // 编辑对话框的表单规则
      addFromRules: {
        city: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市的数据
      cityData: cityData,
      // 控制物流对话框的显示与隐藏
      progressDialogVisible: false,
      // 物流数据列表
      progerssInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取order数据
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      }
      console.log(res.data)
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    // 当显示多少条数据改变时，触发这个函数
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    // 当当前页面改变时，触发这个函数
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    // 点击编辑按钮
    editOrder() {
      this.addressDialogVisible = true
    },
    // 编辑对话框的关闭事件
    addClosed() {
      this.$refs.addFromRef.resetFields()
    },
    // 查看物流
    async showProgerssBox() {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流数据失败')
      }
      this.progerssInfo = res.data
      this.progressDialogVisible = true
      console.log(res.data)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>
