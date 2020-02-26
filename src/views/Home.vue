<template>
  <div class="home">
  </div>
</template>

<script>
// import 'element-ui/lib/theme-chalk/index.css'
import 'element-theme-dark'

export default {
  name: 'Home',

  mounted () {
    this.$router.push({ name: 'app' })
  }
}
</script>
