<template>
  <div class="index" />
</template>

<script>
import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'

export default {
  created () {
    const adapter = new LocalStorage('db')
    const db = low(adapter)

    if (db.has('connections').value() === false) {
      this.$router.push({
        name: 'app-add-connection'
      })
    } else {
      this.$router.push({
        name: 'app'
      })
    }
  }
}
</script>
