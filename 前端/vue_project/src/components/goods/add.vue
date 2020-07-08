<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--警告区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center></el-alert>
      <!--步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--tab标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="tabsBeoforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <!--级联选择框-->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="goodsList"
                :props="goodsPros"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="item" v-for="(item, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器-->
            <quill-editor ref="myQuillEditorRef" v-model="addForm.goods_introduce" />
            <el-button type="primary" class="addBtn" @click="add">添加按钮</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片对话框-->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条的激活下标
      activeIndex: '0',
      // 表单的数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择项的值
        goods_cat: [],
        // 图片的pic途径
        pics: [],
        // 富文本编辑器的内容
        goods_introduce: '',
        attrs: []
      },
      // 表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      // 商品数据列表对象
      goodsList: [],
      // 配置级联选择项的对象
      goodsPros: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片上传的地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制图片对话框的显示与隐藏
      previewVisible: false,
      // 图片的 URl 地址
      previewPath: ''
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data
    },
    // 选项卡变化时，触发这个函数
    handleChange() {
      // 如果没有选择最后一项，不让他选中
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    tabsBeoforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        // 阻止切换标签页
        return false
      }
    },
    // 切换选项卡时触发这个函数
    async tabClick() {
      if (this.activeIndex === '1') {
        // 第二个选项卡
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 第三个选项卡
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态列表失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 预览图片的处理函数
    handlePreview(file) {
      // 获取到file的url地址
      const urlPath = file.response.data.url
      // 复制给previewPaht
      this.previewPath = urlPath
      // 显示图片对话框
      this.previewVisible = true
    },
    // 删除图片的处理函数
    handleRemove(file) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics 数组中，知道这个图片对应的索引值
      const index = this.addForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      // 3. 调用数组的 splice 方法。把图片信息对象，从 pics 数组移除
      this.addForm.pics.splice(index, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 1，创建对象，把路径添加到对象当中
      const picInfo = { pic: response.data.tmp_path }
      // 2.把对象添加到pic数组当中
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('填写必要的表单项')
        // 执行添加的业务逻辑
        //  深拷贝  lodash cloneDeep(obj)
        const from = _.cloneDeep(this.addForm)
        from.goods_cat = from.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(obj)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(obj)
        })
        from.attrs = this.addForm.attrs
        console.log(from)
        // 发起请求添加商品
        // 商品名称，必须是唯一
        const { data: res } = await this.$http.post('goods', from)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        // 通过编程式导航跳转到goods页面
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return true
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
  height: 100%;
}
.addBtn {
  margin-top: 15px;
}
</style>
