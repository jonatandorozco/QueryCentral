<template>
  <el-container style="height: 100vh; border: 1px solid #eee">
    <el-header class="menu-bar">
      <el-menu
        default-active="1"
        class="el-menu-demo"
        mode="horizontal"
      >
        <el-menu-item index="1">
          DataPoint
        </el-menu-item>
        <el-submenu index="2">
          <template slot="title">
            Workspace
          </template>
          <el-menu-item index="2-1">
            item one
          </el-menu-item>
          <el-menu-item index="2-2">
            item two
          </el-menu-item>
          <el-menu-item index="2-3">
            item three
          </el-menu-item>
          <el-submenu index="2-4">
            <template slot="title">
              item four
            </template>
            <el-menu-item index="2-4-1">
              item one
            </el-menu-item>
            <el-menu-item index="2-4-2">
              item two
            </el-menu-item>
            <el-menu-item index="2-4-3">
              item three
            </el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-menu-item index="3" disabled>
          Info
        </el-menu-item>
        <el-menu-item index="4">
          <a href="https://www.ele.me" target="_blank">Orders</a>
        </el-menu-item>
      </el-menu>
    </el-header>
    <multipane>
      <el-aside
        style="height: calc(100vh - 61px); background-color: rgb(238, 241, 246); min-width: 150px;"
      >
        <el-tree
          accordion
          lazy
          :load="loadNodes"
          :props="props"
          style="height: calc(100vh - 61px); max-height: calc(100vh - 60px); background-color: rgb(238, 241, 246);"
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
            <i v-else class="fas fa-chevron-right" />
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-aside>
      <multipane-resizer />
      <el-container>
        <el-main>
          <el-table :data="tableData">
            <el-table-column prop="date" label="Date" width="140" />
            <el-table-column prop="name" label="Name" width="120" />
            <el-table-column prop="address" label="Address" />
          </el-table>
        </el-main>
      </el-container>
    </multipane>
  </el-container>
</template>

<script>
import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Multipane, MultipaneResizer } from 'vue-multipane'

export default {
  layout: 'app',

  components: {
    // FontAwesomeIcon,
    Multipane,
    MultipaneResizer
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
      internalDb: null
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

    self
      .$axios({
        url: 'http://127.0.0.1:3333/connection/objects',
        method: 'POST',
        data: self.selectedConnection
      })
      .then((response) => {
        self.dbObjects = response.data.map((object) => {
          return {
            id: object.id,
            label: object.name,
            type: 'database',
            children: [
              {
                label: 'Tablas',
                type: 'data:table'
              }
            ]
          }
        })
      })
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
                url: 'http://127.0.0.1:3333/connection/objects',
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
                url: 'http://127.0.0.1:3333/database/tables',
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
                url: 'http://127.0.0.1:3333/database/views',
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
        }
      }
    },

    changeAsideSize (x, y, width, height) {
      this.asideSize = width
    }
  }
}
</script>
