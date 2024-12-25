<template>
  <main>
    <ul>
      <li v-for="route in routerMap" :key="route.name">
        <nuxt-link :to="route.path">{{ route.name }}</nuxt-link>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const routerMap = [
  {
    name: 'Project 1',
    path: '/project1',
  },
  {
    name: 'Project 2',
    path: '/project2',
  },
  {
    name: 'Project 3',
    path: '/project3',
  },
]
</script>

<style scoped lang="scss">
main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #5d5d5d;
}
a {
  color: #fff;
  text-decoration: none;
  font-size: 2rem;
  transition: all 0.3s;
  &:hover {
    color: blue;
  }
}
ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  flex-direction: column;
}
</style>
