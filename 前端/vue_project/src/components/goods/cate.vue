<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card class="box-card">
      <!--添加角色-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addSort">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!--是否有效-->
        <template slot="isok" slot-scope="scope">
          <i
            style="color: lightgreen;"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: red;" class="el-icon-error" v-else></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt" slot-scope>
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加分类对话框-->
      <el-dialog title="添加分类" :visible.sync="sortDialogVisible" width="50%" @close="cateClosed">
        <!-- 主体区域-->
        <el-form
          :model="addCateFrom"
          :rules="addCateFromRules"
          ref="addCateFromRef"
          label-width="100px"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateFrom.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父类名称：">
            <!-- options 用来指定数据源-->
            <!-- props 用来指定配置对象-->
            <el-cascader
              v-model="selecteKeys"
              expand-trigger="hover"
              :options="parentcatelist"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="sortDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 列的数据
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这列使用模板名称
          template: 'order'
        },
        {
          label: '操作 ',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这列使用模板名称
          template: 'opt'
        }
      ],
      // 控制分类对话框的显示与隐藏
      sortDialogVisible: false,
      // 添加分类表单的数据对象
      addCateFrom: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级的id
        cat_pid: 0,
        // 分类名称的等级，默认为0 添加的是1级
        cat_level: 0
      },
      // 添加分类表单的规则
      addCateFromRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 存放父级分类列表
      parentcatelist: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selecteKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      // 把数据列表赋值给数据列表
      this.cateList = res.data.result
      // 为总数居条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    // 监听 pagenum 的改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    // 点击添加分类按钮
    addSort() {
      // 获取父级分类的数据列表
      this.getParentCateList()
      // 显示分类对话框
      this.sortDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      // 把数据列表赋值给数据列表
      this.parentcatelist = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // 如果selectedKeys 数组中的 length 大于0，证明选择的父级分类
      // 反之，就说明没有选择任何父级分类
      if (this.selecteKeys.length > 0) {
        // 父级分类的id
        this.addCateFrom.cat_pid = this.selecteKeys[this.selecteKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateFrom.cat_level = this.selecteKeys.length
        return ''
      } else {
        // 父级分类的id
        this.addCateFrom.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateFrom.cat_level = 0
      }
    },
    // 点击确定按钮，添加新的分类
    addCate() {
      this.$refs.addCateFromRef.validate(async valid => {
        if (!valid) return ''
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateFrom
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.sortDialogVisible = false
      })
    },
    // 监听对话框的关闭事件， 重置表单数据
    cateClosed() {
      this.$refs.addCateFromRef.resetFields()
      this.selecteKeys = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin-bottom: 10px;
}
.el-cascader {
  width: 100%;
}
</style>
