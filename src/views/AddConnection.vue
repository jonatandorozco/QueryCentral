<template>
  <Dialog
    title="Add connection"
    :visible.sync="dialogVisible"
    width="40%"
    top="5vh"
    :before-close="void(0)"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <Form ref="form" :model="db">
      <FormItem label="Connection name">
        <Input v-model="name" style="width: 100%" />
      </FormItem>

      <FormItem label="Database Engine">
        <Select v-model="db.type" placeholder="Choose a DB engine" style="width: 100%;" @change="disableSave()">
          <Option label="MySQL" value="mysql" />
          <Option label="Oracle" value="oracle" />
        </Select>
      </FormItem>

      <FormItem label="Host">
        <Col>
          <Row>
            <Col style="width: 80%;">
              <Input v-model="db.host" @input="disableSave()" />
            </Col>

            <Col style="width: 20%;">
              <Input v-if="db.port === null" v-model="db.port" :controls="false" style="position: relative; width: 100%;" @change="disableSave()" />
              <InputNumber v-else v-model="db.port" :controls="false" style="position: relative; width: 100%;" @change="disableSave()" />
            </Col>
          </Row>
        </Col>
      </FormItem>

      <FormItem label="Username">
        <Input v-model="db.username" style="width: 100%;" @input="disableSave()" />
      </FormItem>

      <FormItem label="Password">
        <Input v-model="db.password" style="width: 100%;" show-password @input="disableSave()" />
      </FormItem>
    </Form>
    <span slot="footer" class="dialog-footer">
      <Button type="info" style="float: left;" :disabled="!validConnection" :loading="testing" @click="testConnection()">Test connection</Button>
      <Button v-if="hasConnections" @click="() => this.$router.push({ name: 'app' })">Cancel</Button>
      <Button type="primary" :disabled="!validConnection || !canConnect" :loading="saving" @click="saveConnection()">Save connection</Button>
    </span>
  </Dialog>
</template>

<script>
import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import { Dialog, Select, Option, Button, Input, InputNumber, Form, FormItem, Col, Row } from 'element-ui'

export default {
  components: { Dialog, Select, Option, Button, Input, InputNumber, Form, FormItem, Col, Row },

  data () {
    return {
      dialogVisible: true,
      db: {
        type: null,
        host: null,
        port: null,
        username: '',
        password: ''
      },
      name: '',

      testing: false,
      saving: false,
      canConnect: false,
      hasConnections: false
    }
  },

  mounted () {
    const self = this
    const adapter = new LocalStorage('db')
    const db = low(adapter)
    self.internalDb = db

    const _connections = self.internalDb
      .get('connections')
      .value()

    if (typeof _connections !== 'undefined') {
      self.hasConnections = true
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
        url: `${self.API_URL}/connection/test`,
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

    saveConnection () {
      const self = this
      self.saving = true

      const _connection = self.db
      _connection.active = true
      _connection.name = self.name

      self.internalDb.set('connections', []).write()
      self.internalDb.get('connections').push(_connection).write()
      self.$notify.success({
        title: 'Correcto',
        message: 'Conexión guardada'
      })
      self.saving = false
      setTimeout(() => {
        self.$router.push({ name: 'app' })
      }, 500)
    },

    disableSave () {
      this.canConnect = false
    }
  }
}
</script>
