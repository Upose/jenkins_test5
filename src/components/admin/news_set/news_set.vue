<!---新闻发布-应用设置-->
<template>
  <div class="admin-warp-page">
    <el-container>
      <el-aside width="auto" :collapse="$root.collapse" :class="$root.collapse ? 'fold-menu' : ''">
        <serviceLMenu :isActive="3"></serviceLMenu>
      </el-aside>
      <el-main class="admin-content pd admin-bg-top" :class="{ 'content-collapse': $root.collapse }">
        <breadcrumb :cuMenu="'应用中心'" :fontColor="'fff'"></breadcrumb><!--面包屑导航--->
        <div class="content">
          <el-form :model="postForm" :rules="rules" label-suffix="：" ref="postForm" label-width="150px"
            class="admin-form">
            <h1 class="s-b-border-title">应用设置</h1>
            <div class="form-content">
              <el-form-item label="启用敏感词过滤">
                <el-switch :active-value="1" :inactive-value="0" v-model="postForm.sensitiveWords"></el-switch>
              </el-form-item>
              <el-form-item label="统一关闭评论留言">
                <el-switch :active-value="1" :inactive-value="0" v-model="postForm.comments"></el-switch>
              </el-form-item>
              <el-form-item label="栏目管理权限">
                <div class="table-pd">
                  <div class="table-pd-title"><span class="col col1">序号</span><span class="col col2">栏目名称</span><span
                      class="col col3">授权管理员</span><span class="col col4">操作</span></div>
                  <el-collapse @change="handleChange" class="table-warp" v-model="activeNames" v-loading="loading"
                    :class="!loading && tableData.length == 0 ? 'empty-data-admin' : ''">
                    <el-collapse-item v-for="(item, index) in tableData" :key="index" :name="index">
                      <template slot="title">
                        <span class="col col1">{{ index+ 1}}</span>
                        <span class="col col2" :class="activeNames.indexOf(index) > -1 ? 'open-fold-line' : ''"
                          :title="item.title"><i class=" col-icon"
                            :class="activeNames.indexOf(index) > -1 ? 'el-icon-remove' : 'el-icon-circle-plus'"></i><i
                            class="title">{{ item.title || '' }}</i></span>
                        <span class="col col3"><span v-for="(ite, k) in (item.managerList || [])">{{
                          ite.manager || ''
                        }},</span></span><span class="col col4"><span
                            @click.stop="handleSet(item.title, item.columnID, '0', (item.managerList || []))"
                            class="btns-edit"><i class="iconfont el-icon-vip-bianji"></i>修改</span></span>
                      </template>
                      <div class="table-pd-row" v-for="(it, i) in (item.list || [])" :key="i + '_a'">
                        <span class="col col1"></span><span class="col col2 fold-line">{{
                          it.auditProcessName || ''
                        }}</span>
                        <span class="col col3"><span v-for="(ite, k) in (it.listPermissions || [])">{{
                          ite.manager || ''
                        }},</span></span>
                        <span class="col col4" v-if="isAuth('permissionedit')"><span
                            @click.stop="handleSet((item.title || '') + ' — ' + (it.auditProcessName || ''), item.columnID, it.auditProcessStatus, (it.listPermissions || []))"
                            class="btns-edit"><i class="iconfont el-icon-vip-bianji"></i>修改</span></span>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button icon="iconfont el-icon-vip-quxiao" size="medium" @click="resetForm()">重置</el-button>
                <el-button icon="iconfont el-icon-vip-baocun1" size="medium" v-if="isAuth('save')" type="primary"
                  @click="submitForm('postForm')" :loading="saveLoading" v-button-debounce>保存</el-button>
              </el-form-item>
            </div>
          </el-form>
        </div><!---内容板块 end--->
        <editsq :dataList="alert_data" @alertHide="alertHide" v-if="alert_show"></editsq>
        <footerPage class="top20"></footerPage>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import footerPage from "@/components/admin/common/footer";
import breadcrumb from "@/components/admin/common/breadcrumb";
import serviceLMenu from "@/components/admin/common/serviceLMenu";
import editsq from "./model/editsq";

export default {
  name: 'index',
  beforeCreate() {
    if (this.$store.state.menuList && this.$store.state.menuList.length > 0) {
      var is_list = this.$store.state.menuList.filter(x => x.component == this.$route.path) || [];
      if (is_list.length == 0) {
        this.$router.push('/403')
      }
    }
  },
  created() {
    this.bus.$on('collapse', msg => {
      this.$root.collapse = msg;
    })
  },
  components: { footerPage, serviceLMenu, breadcrumb, editsq },
  data() {
    return {
      loading: true,
      saveLoading: false,
      select_img: null,
      alert_data: {},
      activeNames: [],//展开了哪几栏
      alert_show: false,
      tableData: [],
      postForm: {
        sensitiveWords: 0,//启用敏感词过滤
        comments: 1,//统一关闭评论留言
      },
      rules: {
        // name: [
        //     { required: true, message: '请输入内容', trigger: 'blur' }
        // ],
      },
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    // 页面子权限判定
    isAuth(name) {
      let authList = this.$store.state.menuList;
      let curAuth = authList && authList.find(item => (item.component == '/admin_newsSet'));
      let curSonAuth = curAuth ? curAuth.listPermission.includes(name) : null;
      return curSonAuth ? true : false;
    },
    initData() {
      //获取两个开关
      this.http.postJson('news-settings-get', {}).then(res => {
        if (res.data) {
          this.postForm = res.data;
        }
      }).catch(err => {
        console.log(err);
      })
      //获取列表父级
      this.http.getPlain_url('news-column-permissions-list-get', '').then(res => {
        this.loading = false;
        this.tableData = res.data || [];
      }).catch(err => {
        this.loading = false;
        console.log(err);
      })
    },
    //重置表单
    resetForm() {
      this.initData();
    },
    openMenu(id, index) {
      //根据父级id获取子集列表
      this.http.getJson('news-column-permissions-by-column-id-get', { columnID: id }).then(res => {
        this.tableData[index]['list'] = res.data || [];
        this.$forceUpdate();
      }).catch(err => {
        console.log(err);
      })
    },
    //表格点击展开
    handleChange(val) {
      if (this.activeNames.length > 0) {
        this.activeNames.forEach(item => {
          if (!this.tableData[item]['list']) {
            this.openMenu(this.tableData[item].columnID, item);
          }
        })
      }
    },
    alertHide() {
      this.alert_show = false;
    },
    handleSet(title, c_id, status, list) {//标题，栏目id，状态id
      this.alert_data = {
        title: title,
        columnID: c_id,
        permission: status,
        managerList: list || [],
      };
      this.alert_show = true;
    },
    //表单提交
    submitForm(formName) {

      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.http.postJson('news-settings-save', this.postForm).then(res => {
            this.$message({ type: 'success', message: '保存成功!' });
            this.saveLoading = false;
          }).catch(err => {
            this.saveLoading = false;
            this.$message({ type: 'error', message: '保存失败!' });
          })
        }
      });
    },

  },
}
</script>

<style lang="less" scoped>
@import "../../../assets/admin/css/color.less";
@import "../../../assets/admin/css/style.less";
@import "../../../assets/admin/css/table.less";
@import "../../../assets/admin/css//news_set/news_set.less";
</style>
