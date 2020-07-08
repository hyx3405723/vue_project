<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card class="box-card">
      <!--添加角色-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <el-table :data="rolesList" stripe border>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bodbottom',i1 === 0 ? 'bodtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="closeTag(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级权限-->
              <el-col :span="19">
                <!--通过for循环渲染二级权限-->
                <el-row
                  :class="[i2 === 0 ? '' : 'bodtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="closeTag(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="closeTag(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRights(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisiable"
      width="50%"
      @close="setRightsClosed"
    >
      <!--Tree树形区域-->
      <el-tree
        :data="rightsList"
        :props="TreeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="addRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制权限对话框的显示与隐藏
      setRightDialogVisiable: false,
      // 权限列表
      rightsList: [],
      // 树形列表的绑定属性
      TreeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的id值数组
      defKeys: [],
      // 角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rolesList = res.data
    },
    // 根据id是否删除该权限
    async closeTag(role, rightId) {
      // 弹框提示用户是否删除该权限
      const confirmRes = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色的权限失败')
      }
      // 重新赋值给children
      role.children = res.data
    },
    async setRights(role) {
      this.roleId = role.id
      // 发送请求 获取所有的权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 把获取到的权限保存在 data 中
      this.rightsList = res.data

      // 调用getTreeNodeList 获取三级权限
      this.getTreeNodeList(role, this.defKeys)
      // 显示分配权限对话框
      this.setRightDialogVisiable = true
    },
    // 通过递归的方式 获取三级节点
    getTreeNodeList(node, arr) {
      // node是三级节点，就把id加入到数组当中
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getTreeNodeList(item, arr)
      })
    },
    // 监听权限对话框的关闭
    setRightsClosed() {
      this.defKeys = []
    },
    // 点击确定按钮，为角色添加权限
    async addRights() {
      const arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const treeStr = arr.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: treeStr
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('添加权限列表失败')
      }
      // 提示用户添加权限成功
      this.$message.success('添加权限列表成功')
      // 隐藏权限对话框
      this.setRightDialogVisiable = false
      // 重新获取权限列表
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 5px;
}
.bodtop {
  border-top: 1px solid #eee;
}
.bodbottom {
  border-bottom: 1px solid #eee;
}
</style>
