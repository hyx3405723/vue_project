<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域-->
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>
      <!-- 登录区域-->
      <el-form
        ref="loginFromRef"
        :rules="loginFormRules"
        :model="loginFrom"
        label-width="0px"
        class="login_from"
      >
        <!--用户名-->
        <el-form-item prop="username">
          <el-input
            v-model="loginFrom.username"
            placeholder="请输入用户"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input
            v-model="loginFrom.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!--按钮-->
        <el-form-item class="btns">
          <el-button type="primary" @click="validate()">登录</el-button>
          <el-button type="info" @click="resetLoginFrom()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  // 这是表单的数据
  data () {
    return {
      loginFrom: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        // 用户名的验证
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginFrom () {
      this.$refs.loginFromRef.resetFields()
    },
    // 预验证
    validate () {
      this.$refs.loginFromRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginFrom)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // 1.将登录成功之后的 token 保存到客户端的 sessionStorage 中
        // 1.1项目中出了登录之外的其他API接口，必须在登录之后才能访问
        // 1.2 token 只应在当前网站打开期间生效 ， 哟所以将token保存在 sessionStorage
        window.sessionStorage.setItem('token', res.data.token)
        // 2.通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_from {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
