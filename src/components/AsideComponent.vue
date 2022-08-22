<template>
  <el-menu
      style="width: 200px; height: calc(100vh - 50px)"
      default-active="1"
      class="el-menu-vertical-demo"
      router
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><map-location/></el-icon>
        <span>Database</span>
      </template>
      <el-menu-item index="1-1" @click="routeToUser">User</el-menu-item>
      <el-menu-item index="1-2" @click="routeToProfile">Profile</el-menu-item>
      <el-menu-item index="1-3" @click="routeToHobby">Hobby</el-menu-item>
      <el-menu-item index="1-4" @click="routeToFile">File</el-menu-item>
    </el-sub-menu>

    <el-menu-item index="2" @click="routeToFastCode">
      <el-icon><money/></el-icon>
      <span>Fast Code</span>
    </el-menu-item>

    <el-menu-item index="4" @click="routeToProfileDemo">
      <el-icon><setting/></el-icon>
      <span>ProfileDemo</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
import {Document, LocationFilled, MapLocation, Money, Setting} from "@element-plus/icons-vue";

export default {
  name: "myAside",
  components: {Money, MapLocation, LocationFilled, Document, Setting},
  methods:{
    routeToUser(){
      this.$router.push("/control/user-controller")
    },
    routeToProfile(){
      this.$router.push("/control/profile-controller")
    },
    routeToHobby(){
      this.$router.push("/control/hobby-controller")
    },
    routeToFile(){
      this.$router.push("/control/file-controller")
    },
    routeToFastCode(){
      this.$router.push("/control/fastcode-controller")
    },
    routeToProfileDemo(){
      this.$router.push("/control/profile-demo")
    },
  }
}
</script>

<style scoped>

</style>