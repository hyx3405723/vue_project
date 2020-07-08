<template>
  <div>
    <!--面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <!--搜索和添加区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="usersInfo.query" clearable @clear="getUserlist">
            <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addDialogVisible = true">添加</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userChangeStatus(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUserInfo(scope.row.id)"
            ></el-button>
            <!--删除按钮-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <!--分配角色按钮-->
            <el-tooltip content="分配角色" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="resignRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="usersInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="usersInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!--添加用户的对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!--主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!--主体区域-->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配角色的对话框-->
    <el-dialog title="分配角色" :visible.sync="RightsDialogVisible" width="50%" @close="regsignClosed">
      <div>
        <p>当前的用户： {{currentInfo.username}}</p>
        <p>当前的角色： {{currentInfo.role_name}}</p>
        <p>
          当前的角色：
          <el-select v-model="selectdId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="RightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      // 邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      // 合法的正则表达式
      if (regEmail.test(value)) {
        return callback()
      }
      // 不合法的表达式， 发送错误的信息
      callback(new Error('请输入合法的邮箱'))
    }
    // 验证手机的规则
    var checkPhone = (rule, value, callback) => {
      // 邮箱的正则表达式
      const regPhone = /^(0|86|17591)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      // 合法的正则表达式
      if (regPhone.test(value)) {
        return callback()
      }
      // 不合法的表达式， 发送错误的信息
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      usersInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表
      userList: [],
      // 总数据条数
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 编辑用户数据对象
      editForm: {},
      // 添加用户规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 控制分配角色的显示和隐藏
      RightsDialogVisible: false,
      // 分配角色对话框的当前信息
      currentInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选择角色的id
      selectdId: ''
    }
  },
  created() {
    this.getUserlist()
  },
  methods: {
    async getUserlist() {
      const { data: res } = await this.$http.get('users', {
        params: this.usersInfo
      })
      // 失败
      if (res.meta.status !== 200) {
        return this.$message.console.error('获取用户数据失败')
      }
      // 成功则赋值给用户列表和总数据条数
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.usersInfo.pagesize = newSize
      this.getUserlist()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.usersInfo.pagenum = newPage
      this.getUserlist()
    },
    // 监听 switch开关状态 改变的事件
    async userChangeStatus(scopeRow) {
      const { data: res } = await this.$http.put(
        `users/${scopeRow.id}/state/${scopeRow.mg_state}`
      )
      if (res.meta.status !== 200) {
        scopeRow.mg_state = !scopeRow.mg_state
        return this.$message.error('修改用户失败')
      }
      this.$message.success('修改用户成功')
    },
    // 重置用户对话框的内容
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return ''
        // 验证通过，可以添加用户
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUserlist()
      })
    },
    // 点击编辑按钮 编辑用户信息
    async editUserInfo(id) {
      // 根据id发送请求
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      this.editForm = res.data
      // 显示编辑用户对话框
      this.editDialogVisible = true
    },
    // 重置编辑用户对话框的内容
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮，发送修改用户信息的请求
    editUser() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return ''
        // 发送请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) return this.$message.error('更新用户失败')
        // 隐藏修改用户对话框
        this.editDialogVisible = false
        // 重新获取用户列表数据
        this.getUserlist()
        // 提示用户更新用户成功
        this.$message.success('更新用户成功')
      })
    },
    // 点击删除按钮，删除用户信息
    async deleteUser(id) {
      // messagebox弹出框
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      // 如果用户点击了确实 confirmRes值为confirm
      // 如果用户点击了取消 confirmRes值为cancel
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发送删除用户信息的请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // 重新获取用户列表信息
      this.getUserlist()
      // 提示用户删除成功
      this.$message.success('删除用户成功')
    },
    // 点击分配角色按钮
    async resignRoles(scopeRow) {
      this.currentInfo = scopeRow
      // 展示对话框之前，获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有的角色列表失败')
      }
      this.rolesList = res.data
      // 显示分配角色对话框
      this.RightsDialogVisible = true
    },
    // 点击分配角色对话框的确定按钮，更新角色
    async saveRoleInfo() {
      if (!this.selectdId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.currentInfo.id}/role`,
        {
          rid: this.selectdId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      // 隐藏分配角色对话框
      this.RightsDialogVisible = false
      this.getUserlist()
    },
    // 关闭分配角色对话框
    regsignClosed() {
      this.currentInfo = {}
      this.selectdId = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>
