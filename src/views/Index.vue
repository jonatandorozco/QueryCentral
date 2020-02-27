<template>
  <Container style="height: calc(100vh - 30px);">
    <Row style="width: 100vw;">
      <Col>
        <Multipane>
          <Aside
            style="height: calc(100vh - 31px);"
          >
            <Tree
              accordion
              lazy
              highlight-current
              :load="loadNodes"
              :props="props"
              style="height: calc(100vh - 31px); max-height: calc(100vh - 31px);"
            >
              <span slot-scope="{ node }" class="custom-tree-node" style="user-select: none;">
                <i v-if="node.level === 1" class="fas fa-archive" />
                <i v-else-if="node.level === 3" class="fas fa-database" />
                <i
                  v-else-if="node.level === 5 && node.data.type ==='data:table'"
                  class="fas fa-table"
                />
                <i
                  v-else-if="node.level === 5 && node.data.type ==='data:view'"
                  class="fas fa-eye"
                />
                <span>&nbsp;{{ node.label }}</span>
                <span v-if="node.level === 1">
                  <Button
                    type="text"
                    size="mini"
                    @click="() => remove(node, data)"
                  >
                    <i class="fas fa-chevron-up"/> Collapse
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
      </Col>
    </Row>
  </Container>
</template>

<script>
import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import { Multipane, MultipaneResizer } from 'vue-multipane'
// import MonacoEditor from 'vue-monaco'
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
      code: 'SELECT * FROM '
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
  },

  methods: {
    loadNodes (node, resolve) {
      const self = this
      if (node.level === 0) {
        return resolve([
          {
            name: 'Conexiones'
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
          }
        ])
      }

      if (node.level === 3) {
        switch (node.data.type) {
          case 'data:database':
            self
              .$axios({
                url: `${self.API_URL}/connection/objects`,
                method: 'POST',
                data: node.parent.data.connection
              })
              .then((response) => {
                resolve(response.data)
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

    newSQLTab () {
      this.tabs.push({
        title: 'Nueva consulta',
        type: 'query'
      })
    }
  }
}
</script>
