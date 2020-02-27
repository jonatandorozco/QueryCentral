<template>
  <Container style="height: calc(100vh - 30px);">
    <Row style="width: 100vw;">
      <Col>
        <Multipane>
          <Aside
            style="height: calc(100vh - 31px);"
          >
            <Tree
              ref="tree"
              v-if="showTree"
              accordion
              lazy
              highlight-current
              :expand-on-click-node="false"
              :load="loadNodes"
              :node-expand="checkNodes"
              :props="props"
              :default-expanded-keys="defaultExpandedKeys"
              :current-node-key="currentNodeKey"
              style="height: calc(100vh - 31px); max-height: calc(100vh - 31px);"
            >
              <span slot-scope="{ node }" class="custom-tree-node" style="user-select: none;">
                <i v-if="node.level === 1" class="fas fa-archive" />
                <i v-else-if="node.level === 3 && node.data.type === 'data:database'" class="fas fa-database" />
                <i v-else-if="node.level === 3 && node.data.type === 'data:user'" class="fas fa-users" />
                <i
                  v-else-if="node.level === 5 && node.data.type ==='data:table'"
                  class="fas fa-table"
                />
                <i
                  v-else-if="node.level === 5 && node.data.type ==='data:view'"
                  class="fas fa-eye"
                />
                <i
                  v-else-if="node.level === 5 && node.data.type ==='data:function'"
                  class="fas fa-terminal"
                />
                <i
                  v-else-if="node.level === 5 && node.data.type ==='data:procedure'"
                  class="fas fa-terminal"
                />
                <i
                  v-else-if="node.level === 5 && node.data.type ==='data:trigger'"
                  class="fas fa-code-branch"
                />
                <span>&nbsp;{{ node.label }}</span>
                <span v-if="node.level === 1" style="margin-left: 12px;">
                  <Button
                    type="text"
                    size="mini"
                    @click="newConnection()"
                  >
                    <i class="fas fa-plus action-button" title="Nueva conexión" />
                  </Button>
                  <Button
                    type="text"
                    size="mini"
                    @click="refreshTree()"
                  >
                    <i class="fas fa-sync action-button action-button-secondary" title="Actualizar" />
                  </Button>
                </span>

                <span v-if="node.level === 2" style="margin-left: 12px;">
                  <Button
                    type="text"
                    size="mini"
                  >
                    <i class="fas fa-pen action-button" title="Actualizar" />
                  </Button>
                  <Button
                    type="text"
                    size="mini"
                    @click="refreshTree()"
                  >
                    <i class="fas fa-trash-alt action-button action-button-danger" title="Eliminar" />
                  </Button>
                </span>

                <span v-if="node.level === 3" style="margin-left: 12px;">
                  <Button
                    type="text"
                    size="mini"
                  >
                    <i class="fas fa-plus action-button" title="Actualizar" />
                  </Button>
                </span>

                <span v-if="node.level === 4" style="margin-left: 12px;">
                  <Button
                    type="text"
                    size="mini"
                  >
                    <i class="fas fa-pen action-button" title="Actualizar" />
                  </Button>
                  <Button
                    type="text"
                    size="mini"
                    @click="refreshTree()"
                  >
                    <i class="fas fa-trash-alt action-button" title="Actualizar" />
                  </Button>
                </span>

                <span v-if="node.level === 5" style="margin-left: 12px;">
                  <Button
                    type="text"
                    size="mini"
                  >
                    <i class="fas fa-plus action-button" title="Actualizar" />
                  </Button>
                </span>

                <span v-if="node.level === 6" style="margin-left: 12px;">
                  <Button
                    type="text"
                    size="mini"
                  >
                    <i class="fas fa-pen action-button" title="Actualizar" />
                  </Button>
                  <Button
                    type="text"
                    size="mini"
                  >
                    <i class="fas fa-brush action-button action-button-primary" title="Limpiar" />
                  </Button>
                  <Button
                    type="text"
                    size="mini"
                    @click="refreshTree()"
                  >
                    <i class="fas fa-trash-alt action-button action-button-danger" title="Actualizar" />
                  </Button>
                </span>
              </span>
            </Tree>
          </Aside>
          <MultipaneResizer />
          <Container style="height: calc(100vh - 31px);">
            <Main >
              <Menu
                default-active="0"
                class="tab-controller"
                mode="horizontal"
              >
                <MenuItem v-for="(tab, index) in tabs" :key="index" :index="String(index)" class="tab-controller-item">
                  {{ tab.title }}
                  <span>&times;</span>
                </MenuItem>
              </Menu>
            </Main>
          </Container>
        </Multipane>
      </col>
    </Row>
  </Container>
</template>

<script>
import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import { Multipane, MultipaneResizer } from 'vue-multipane'
// import MonacoEditor from 'vue-monaco'
import contextMenu from 'electron-context-menu'
import {
  Container,
  Main,
  Tree,
  Aside,
  Menu,
  MenuItem,
  Row,
  Col,
  Button
} from 'element-ui'

export default {
  name: 'Index',

  components: {
    Multipane,
    MultipaneResizer,
    // MonacoEditor,
    Container,
    Main,
    Tree,
    Aside,
    Menu,
    MenuItem,
    Row,
    Col,
    Button
  },

  data () {
    return {
      tableData: [],
      dbObjects: [],
      selectedDatabase: null,
      selectedConnection: null,
      props: {
        label: 'name',
        children: 'zones',
        isLeaf: 'noChildren'
      },
      internalDb: null,
      tabs: [{
        title: 'Tabla'
      }],
      code: 'SELECT * FROM ',
      defaultExpandedKeys: null,
      currentNodeKey: null,
      showTree: true
    }
  },

  mounted () {
    const self = this
    const adapter = new LocalStorage('db')
    const db = low(adapter)
    self.internalDb = db

    self.selectedConnection = db
      .get('connections')
      .filter({
        active: true
      })
      .take(1)
      .value()[0]

    if (typeof self.selectedConnection === 'undefined') {
      self.$router.push({ name: 'add-connection' })
    }

    contextMenu({
      prepend: (params, browserWindow) => [
        {
          role: 'zoomIn'
        },
        {
          role: 'zoomOut'
        }
      ]
    })
  },

  methods: {
    collapseTree () {
      this.$refs.tree.store.currentNode.expanded = false
    },

    newConnection () {
      this.$router.push({ name: 'add-connection' })
    },

    refreshTree () {
      this.showTree = false
      this.$nextTick(() => {
        this.showTree = true
      })
    },

    loadNodes (node, resolve) {
      const self = this
      if (node.level === 0) {
        return resolve([
          {
            name: 'Conexiones',
            expanded: false
          }
        ])
      }

      if (node.level === 1) {
        return resolve([
          {
            name: self.internalDb
              .get('connections')
              .filter({
                active: true
              })
              .take(1)
              .value()[0].name,
            connection: self.internalDb
              .get('connections')
              .filter({
                active: true
              })
              .take(1)
              .value()[0]
          }
        ])
      }

      if (node.level === 2) {
        return resolve([
          {
            name: 'Bases de datos',
            type: 'data:database'
          },
          {
            name: 'Usuarios',
            type: 'data:user'
          }
        ])
      }

      if (node.level === 3) {
        switch (node.data.type) {
          case 'data:database':
            self
              .$axios({
                url: `${self.API_URL}/connection/databases`,
                method: 'POST',
                data: node.parent.data.connection
              })
              .then((response) => {
                resolve(response.data)
              })
              .catch(() => {
                self.$notify.error({
                  title: 'No se pudo obtener la información',
                  message: 'Verifique que el servidor esté activo'
                })
                resolve([])
              })
            break
          case 'data:user':
            self
              .$axios({
                url: `${self.API_URL}/connection/users`,
                method: 'POST',
                data: node.parent.data.connection
              })
              .then((response) => {
                resolve(response.data.map(object => {
                  const _object = object
                  _object.noChildren = true

                  return _object
                }))
              })
              .catch(() => {
                self.$notify.error({
                  title: 'No se pudo obtener la información',
                  message: 'Verifique que el servidor esté activo'
                })
                resolve([])
              })
            break
        }
      }

      if (node.level === 4) {
        resolve([
          {
            name: 'Tablas',
            type: 'data:table'
          },
          {
            name: 'Vistas',
            type: 'data:view'
          },
          {
            name: 'Funciones',
            type: 'data:function'
          },
          {
            name: 'Procedimientos',
            type: 'data:procedure'
          },
          {
            name: 'Disparadores',
            type: 'data:trigger'
          }
        ])
      }

      if (node.level === 5) {
        switch (node.data.type) {
          case 'data:table':
            self
              .$axios({
                url: `${self.API_URL}/database/tables`,
                method: 'POST',
                data: {
                  connection: self.selectedConnection,
                  database: node.parent.data.name
                }
              })
              .then((response) => {
                resolve(
                  response.data.map((table) => {
                    const _table = table
                    _table.noChildren = true
                    return _table
                  })
                )
              })
            break
          case 'data:view':
            self
              .$axios({
                url: `${self.API_URL}/database/views`,
                method: 'POST',
                data: {
                  connection: self.selectedConnection,
                  database: node.parent.data.name
                }
              })
              .then((response) => {
                resolve(
                  response.data.map((table) => {
                    const _table = table
                    _table.noChildren = true
                    _table.type = 'data:table:details'
                    return _table
                  })
                )
              })
            break
          case 'data:function':
            self
              .$axios({
                url: `${self.API_URL}/database/functions`,
                method: 'POST',
                data: {
                  connection: self.selectedConnection,
                  database: node.parent.data.name
                }
              })
              .then((response) => {
                resolve(
                  response.data.map((table) => {
                    const _table = table
                    _table.noChildren = true
                    _table.type = 'data:table:details'
                    return _table
                  })
                )
              })
            break
          case 'data:procedure':
            self
              .$axios({
                url: `${self.API_URL}/database/procedures`,
                method: 'POST',
                data: {
                  connection: self.selectedConnection,
                  database: node.parent.data.name
                }
              })
              .then((response) => {
                resolve(
                  response.data.map((table) => {
                    const _table = table
                    _table.noChildren = true
                    _table.type = 'data:table:details'
                    return _table
                  })
                )
              })
            break
          case 'data:trigger':
            self
              .$axios({
                url: `${self.API_URL}/database/triggers`,
                method: 'POST',
                data: {
                  connection: self.selectedConnection,
                  database: node.parent.data.name
                }
              })
              .then((response) => {
                resolve(
                  response.data.map((table) => {
                    const _table = table
                    _table.noChildren = true
                    _table.type = 'data:table:details'
                    return _table
                  })
                )
              })
            break
        }
      }

      if (node.level === 5) {
        switch (node.data.type) {
          case 'data:table:details': {
            console.log(node)
          }
        }

        console.log(node)
      }
    },

    checkNodes (node) {
      if (node.level === 1) {
        if (node.expanded === true) {
          node.data.expanded = true
        }
      }
    },

    newSQLTab () {
      this.tabs.push({
        title: 'Nueva consulta',
        type: 'query'
      })
    }
  }
}
</script>
