<template>
  <el-dialog
    title="Add connection"
    :visible.sync="dialogVisible"
    width="30%"
    :before-close="void(0)"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form ref="form" :model="db">
      <el-form-item label="Connection name">
        <el-input v-model="name" style="width: 100%" />
      </el-form-item>

      <el-form-item label="Database Engine">
        <el-select v-model="db.type" placeholder="Choose a DB engine" style="width: 100%;" @change="disableSave()">
          <el-option label="MySQL" value="mysql" />
          <el-option label="Oracle" value="oracle" />
        </el-select>
      </el-form-item>

      <el-form-item label="Host">
        <el-col>
          <el-input v-model="db.host" style="width: 85%;" @input="disableSave()" /><el-input-number v-model="db.port" style="width: 15%;" :controls="false" @change="disableSave()" />
        </el-col>
      </el-form-item>

      <el-form-item label="Username">
        <el-input v-model="db.username" style="width: 100%;" @input="disableSave()" />
      </el-form-item>

      <el-form-item label="Password">
        <el-input v-model="db.password" style="width: 100%;" show-password @input="disableSave()" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="info" style="float: left;" :disabled="!validConnection" :loading="testing" @click="testConnection()">Test connection</el-button>
      <!-- <el-button @click="dialogVisible = false">Cancel</el-button> -->
      <el-button type="primary" :disabled="!validConnection || !canConnect">Save connection</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      dialogVisible: true,
      db: {
        type: '',
        host: '',
        port: null,
        username: '',
        password: ''
      },
      name: '',

      testing: false,
      canConnect: false
    }
  },

  computed: {
    validConnection () {
      return this.name !== '' && this.db.engine !== '' && this.db.host !== '' && this.db.username !== ''
    },

    selectedDatabaseType () {
      return this.db.type
    }
  },

  watch: {
    selectedDatabaseType (value) {
      const self = this

      switch (value) {
        case 'mysql':
          self.db.port = '3306'
          break
      }
    }
  },

  methods: {
    testConnection () {
      const self = this
      this.testing = true

      self.$axios({
        url: 'http://127.0.0.1:3333/connection/test',
        method: 'POST',
        data: self.db
      })
        .then((response) => {
          self.testing = false
          if (response.status === 204) {
            self.canConnect = true
            self.$notify.success({
              title: 'Correcto',
              message: 'Se ha conectado correctamente'
            })
          }
        })
        .catch(() => {
          self.testing = false
          self.$notify.error({
            title: 'No se pudo conectar',
            message: 'Verifique que el servidor esté activo'
          })
        })
    },

    disableSave () {
      this.canConnect = false
    }
  }
}
</script>
