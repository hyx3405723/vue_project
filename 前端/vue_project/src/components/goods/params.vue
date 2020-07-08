<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card class="box-card">
      <!--警告区域-->
      <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>
      <!--选择参数区域-->
      <el-row class="cat_shop">
        <el-col>
          <span>选择商品分类:</span>
          <!--级联选择框-->
          <el-cascader
            v-model="selecteKeys"
            expand-trigger="hover"
            :options="cateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            :show-all-levels="false"
          ></el-cascader>
        </el-col>
      </el-row>
      <!--Tab 标签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!--添加参数的按钮-->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible =true"
          >添加参数</el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环tag-->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="removeTag(i,scope.row)"
                >{{item}}</el-tag>
                <!--按钮与文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引下标-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editShowDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!--添加属性的按钮-->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible =true"
          >添加属性</el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环tag-->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="removeTag(i,scope.row)"
                >{{item}}</el-tag>
                <!--按钮与文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引下标-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数属性" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope
              ">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editShowDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog
      :title="'添加'+titleParams"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="ParamsDialogClosed"
    >
      <!--表单区域-->
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleParams" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑对话框-->
    <el-dialog
      :title="'修改'+titleParams"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!--表单区域-->
      <el-form
        :model="editParamsForm"
        :rules="editParamsFormRules"
        ref="editParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleParams" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 保存所有的商品分类列表
      cateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selecteKeys: [],
      // 被激活的tab 标签的值(name)
      activeName: 'many',
      // 动态参数的表格数据
      manyTableData: [],
      // 静态参数的表格数据
      onlyTableData: [],
      // 控制添加分类对话框的显示与隐藏
      addDialogVisible: false,
      // 添加表单的数据对象
      addParamsForm: {
        // 参数名称
        attr_name: '',
        // 动态参数 或 静态属性
        attr_sel: this.activeName
      },
      // 添加表单的验证规则
      addParamsFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      //  控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑表单的数据对象
      editParamsForm: {
        // 参数名称
        attr_name: '',
        // 动态参数 或 静态属性
        attr_sel: this.activeName
      },
      // 编辑表单的验证规则
      editParamsFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // tag 标签的数据
      attValsTag: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      // 把数据列表赋值给数据列表
      this.cateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      this.getParamsList()
    },
    // 获取参数的列表的数据
    async getParamsList() {
      // 证明选中的不是三级分类
      if (this.selecteKeys.length !== 3) {
        this.selecteKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 选择的是三级分类
      // 根据分类的id和sel的值，发送请求
      const { data: res } = await this.$http.get(
        `/categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取商列表失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制按钮与文本框的显示和隐藏
        item.inputVisible = false
        // 文本框的值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsList()
    },
    // 监听 添加对话框 的关闭事件
    ParamsDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 点击确定按钮 添加分类，
    addDialogParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return ''
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败')
        }
        this.$message.success('添加商品分类成功')
        this.addDialogVisible = false
        this.getParamsList()
      })
    },
    // 点击编辑按钮 显示对话框
    async editShowDialog(attrId) {
      // 查询当前参数的信息 发送请求
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败!')
      }
      this.editParamsForm = res.data
      // 显示对话框
      this.editDialogVisible = true
    },
    // 编辑对话框 点击确定按钮 修改分类
    editDialogParams() {
      // 提交参数
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return ''
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsList()
      })
    },
    // 监听 编辑对话框 的关闭事件
    editDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 点击删除按钮 删除参数
    async deleteParams(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      // 用户取消了删除操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.$message.success('删除参数成功!')
      this.getParamsList()
    },
    // 按下键盘的某个键 或者失去焦点触发这个函数
    handleInputConfirm(scopeRow) {
      // 输入的内容不合法
      if (scopeRow.inputValue.trim().length === 0) {
        scopeRow.inputValue = ''
        scopeRow.inputVisible = false
        return ''
      }
      //  如果没有return , 则证明输入的内容，需要做后续的处理
      scopeRow.attr_vals.push(scopeRow.inputValue)
      scopeRow.inputValue = ''
      this.saveTags(scopeRow)
      scopeRow.inputVisible = false
    },
    // 点击按钮，显示文本框
    showInput(scopeRow) {
      scopeRow.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 将tag标签 保存在数据库中
    async saveTags(scopeRow) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${scopeRow.attr_id}`,
        {
          attr_name: scopeRow.attr_name,
          attr_sel: scopeRow.attr_sel,
          attr_vals: scopeRow.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功!')
    },
    // 删除tags标签
    removeTag(i, scopeRow) {
      scopeRow.attr_vals.splice(i, 1)
      this.saveTags(scopeRow)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true
    isBtnDisable() {
      if (this.selecteKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的商品分类的Id
    cateId() {
      if (this.selecteKeys.length === 3) {
        return this.selecteKeys[2]
      }
      return true
    },
    // 添加分类的对话框标题
    titleParams() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_shop {
  margin: 15px 0;
}
.el-tag {
  margin-left: 5px;
  margin-right: 5px;
}
.input-new-tag {
  margin-left: 10px !important;
  width: 120px;
}
</style>
