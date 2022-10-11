<template>
  <!--  <div class="header">-->
  <!--    <h2>wisdom connect</h2>-->
  <!--  </div>-->

  <div class="content">
    <div class="logo_and_title">
      <table>
        <tr>
          <td><img src="../image/logo.png" alt="logo" /></td>
          <td><h1>Wisdom Connect</h1></td>
        </tr>
      </table>
    </div>

    <div class="myprofile_container">
      <div class="myprofile_form">
        <div class="myprofile_form_header" style="margin: 30px auto">
          <p>Hi {{ username }}!</p>
        </div>

        <hr />

        <div class="myprofile_addfriend">
          <!-- <input type="input" placeholder="add a friend"/></td> -->
          <button style="margin: 20px auto" @click="next()">Add Firends</button>
        </div>

        <div class="myprofile_display_container">
          <!--------Table------>
          <div class="myprofile_talk_to_sb_new">
            <table>
              <tr>
                <td><img src="../image/flower1.png" /></td>
                <td><p>Talk to someone new</p></td>
              </tr>
            </table>
          </div>

          <div
            class="myprofile_display_content"
            v-for="item in friendTableData"
            :key="item.id"
            @click="clickFriend(item)"
            :class="{ 'select-border': selectedFriendId === item.id }"
          >
            <table>
              <tr>
                <td><img :src="item.icon" /></td>
                <td>
                  <p>{{ item.username }}</p>
                </td>
                <td class="myprofile_display_content_status">
                  <p v-if="item.online === 1">online</p>
                  <p v-else>offline</p>

                  <p v-if="isAvailable(item)">available</p>
                  <p v-else>unavailable</p>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div class="myprofile_switch">
          <table>
            <tr>
              <td>
                <button
                  id="videocall_btn"
                  @click="getConferenceRoom(selectedFriendId)"
                >
                  Make a Video Call
                </button>
              </td>
              <td>
                <button id="me_btn" @click="routeTo('/personal')">Me</button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
  <el-dialog
    title="Waiting for response..."
    v-model="centerDialogVisible1"
    width="30%"
    center
  >
    <span class="dialog-footer">
      <el-button @click="chatClose">Cancel</el-button>
    </span>
  </el-dialog>
  <el-dialog
    title="Friend is unavailable"
    v-model="centerDialogVisible2"
    width="30%"
    center
  >
    <span class="dialog-footer">
      <el-button @click="centerDialogVisible2 = false">Confirm</el-button>
    </span>
  </el-dialog>
  <el-dialog
    title="Friend calling"
    v-model="centerDialogVisible3"
    width="30%"
    center
  >
    <span class="dialog-footer">
      <el-button @click="chatAccept">Accept</el-button>
      <el-button @click="chatClose">Reject</el-button>
    </span>
  </el-dialog>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "TapOnFriend",
  data() {
    return {
      centerDialogVisible1: false,
      centerDialogVisible2: false,
      centerDialogVisible3: false,

      websocket: null,
      // webSocketURL: "ws://ericbackend.azurewebsites.net/chat",
      webSocketURL: "ws://localhost:9090/chat/",
      oncall: false,
      roomId: null,

      disableAccept: false,
      state: "no call",

      username: null,
      friendTableData: [],
      profile: localStorage.getItem("profile")
        ? JSON.parse(localStorage.getItem("profile"))
        : null,
      selectedFriendId: null,

      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      selectedUser: null,
      message: "",
      room: "",
      password: "",
    };
  },
  computed: {},
  created() {
    console.log("build");
    this.load();
    this.username = this.profile.username;
    this.initialWebSocket();
    this.releaseConferenceRoom();
    this.resetOncall()
    
  },
  watch: {
    $route(to, from) {
      this.websocket.close();
      if (this.oncall) {
        this.chatClose();
      }
    },
  },
  destroyed() {
    this.websocket.close();
    if (this.oncall) {
      console.log("des");
      this.chatClose();
    }
  },
  methods: {
    isAvailable(user) {
      console.log(user);
      if (user.online === 0) {
        return false;
      } else {
        if (user.oncall === 0) {
          return true;
        } else {
          return false;
        }
      }
    },
    releaseConferenceRoom() {
      let releaseRoomRequestForm;
      releaseRoomRequestForm = {};

      releaseRoomRequestForm.profileID = this.profile.id;
      releaseRoomRequestForm.targetID = null;
      request
        .post("/conference/releaseRoom", releaseRoomRequestForm)
        .then((res) => {
          // console.log(res);
          if (res.code === "200") {
            this.conferenceRoom = null;
            this.conference = null;
            this.pin = null;
            this.$message({
              type: "success",
              message: "successfully release a room",
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg,
            });
          }
        });
    },
    getConferenceRoom(id) {
      if (!this.isAvailable(this.selectedUser)) {
        this.centerDialogVisible2 = true;
        return;
      }

      request
        .get("/conference/getRoom", {
          params: {
            profileID: this.profile.id,
          },
        })
        .then((res) => {
          // console.log(res);
          if (res.code === "200") {
            this.conferenceRoom = res.data;
            this.conference = res.data.conferenceid;
            this.pin = res.data.pin;
            this.$message({
              type: "success",
              message: "successfully get a room",
            });
            //console.log(this.conferenceRoom);
            let callForm = {};
            callForm.sender = this.profile.id;
            callForm.receiver = id;
            callForm.message = "node-" + this.conference + ";pin-" + this.pin;
            this.websocketSend(JSON.stringify(callForm));
          } else {
            this.$message({
              type: "error",
              message: res.msg,
            });
          }
        });
    },
    routeTo(link) {
      this.$router.push("/personal");
    },
    clickFriend(item) {
      this.selectedFriendId = item.id;
      this.selectedUser = item;
      // console.log(this.selectedFriendId);
    },
    searchUser() {
      request
        .get("/profile/searchProfile", {
          params: {
            profileID: this.profile.id,
            query: this.query,
          },
        })
        .then((res) => {
          // console.log(res);
          this.randomFriendTableData = res.data;
        });
    },
    initialWebSocket() {
      this.webSocketURL =
        // "ws://ericbackend.azurewebsites.net/chat/" +
        "ws://localhost:9090/chat/" + this.user.token + "/" + this.profile.id;
      if (typeof WebSocket === "undefined") {
        return console.log("your browser is not support websocket");
      }
      console.log(this.webSocketURL);
      this.websocket = new WebSocket(this.webSocketURL);
      this.websocket.onmessage = this.websocketOnMessage;
      this.websocket.onopen = this.websocketOnOpen;
      this.websocket.onerror = this.websocketOnError;
      this.websocket.onclose = this.websocketClose;

    },
    websocketOnOpen() {},
    chatAccept() {
      this.centerDialogVisible3 = false;
      this.disableAccept = true;
      let callForm = {};
      callForm.sender = this.profile.id;
      callForm.receiver = this.roomId;
      this.state = "calling";
      callForm.message = "1";

      this.websocketSend(JSON.stringify(callForm));
      // console.log(this.message);
      this.$router.push({
        path: "/videocall",
        query: {
          roomId: this.roomId,
          room: this.room,
          password: this.password,
        },
      });
    },
    chatClose() {
      // call form is used to build websocket request
      let callForm = {};
      // sender is current user's profile id
      callForm.sender = this.profile.id;
      // receiver is used to save the chat room id
      callForm.receiver = this.roomId;
      // message = 2 is means this is a call disacceptance websocket request
      callForm.message = "2";
      this.releaseConferenceRoom();
      this.websocketSend(JSON.stringify(callForm));
      
      this.state = "no call";
      this.oncall = false;
      this.roomId = null;
      this.message = null;
      this.centerDialogVisible1 = false;
      this.centerDialogVisible2 = false;
      this.centerDialogVisible3 = false;
    },
    websocketOnError() {
      // 连接建立失败重连
      this.initialWebSocket();
    },
    websocketOnMessage(e) {
      // 数据接收
      let res = JSON.parse(e.data);
      console.log("receive: ", res);
      if (res.isSystem) {
        //friend online offline notifications
        this.$message({
          type: "success",
          message: res.message + "; friend: " + res.fromName,
        });
      } else {
        if (res.isGetRoomID) {
          // room build
          this.oncall = true;

          this.roomId = res.message;

          //get room information
          request
            .get("/chatcontroller/room", {
              params: {
                roomID: this.roomId,
              },
            })
            .then((res2) => {
              this.message = res2.data.message;

              const [roomStr, passwordStr] = this.message.split(";");
              this.room = roomStr.split("-")[1];
              this.password = passwordStr.split("-")[1];

              // console.log(this.message);
              // console.log("test")
              if (res2.data.holderone === this.profile.id) {
                //current user is chat sender
                this.centerDialogVisible1 = true;
              } else {
                //current user is chat receiver
                this.centerDialogVisible3 = true;
              }
              this.state = "on call";
            });
        } else {
          if (res.message == 1) {
            console.log(this.room);
            console.log(this.password);
            this.$router.push({
              path: "/videocall",
              query: {
                roomId: this.roomId,
                room: this.room,
                password: this.password,
              },
            });

          } else {
            this.$message({
              type: "error",
              message: "your friend closed your call",
            });
            this.releaseConferenceRoom();
            this.state = "no call";
            this.oncall = false;
            this.roomId = null;
            this.centerDialogVisible1 = false;
            this.centerDialogVisible2 = false;
            this.centerDialogVisible3 = false;
          }
        }
      }
      this.getAllFriends();
    },
    websocketSend(Data) {
      this.websocket.send(Data);
    },
    websocketClose(e) {
      console.log("close connection", e);
    },

    resetOncall(){
      let friendRequestForm;
      friendRequestForm = {};

      friendRequestForm.profileID = this.profile.id;
      friendRequestForm.targetID = 0;
      request.put("/profile/oncall", friendRequestForm).then(res => {
        if (res.code === '200') {
          this.$message({
            type: "success",
            message: "successfully reset Oncall"
          })

          localStorage.setItem("profile", JSON.stringify(res.data));
          this.refreshProfile()

        } else {
          this.$message({
            type: "error",
            message: res.msg
          })
        }
      })
    },


    callFriend(id) {
      //console.log(id)

      let callForm = {};
      callForm.sender = this.profile.id;
      callForm.receiver = id;
      callForm.message = "need url";

      this.websocketSend(JSON.stringify(callForm));
    },

    created() {
      console.log("build");
      this.load();
      this.username = this.profile.username;
      this.initialWebSocket();
    },
    refreshProfile() {
      this.profile = localStorage.getItem("profile")
        ? JSON.parse(localStorage.getItem("profile"))
        : {};
      console.log(this.profile);
      this.privacy = this.profile.privacy;
    },
    load() {
      this.refreshProfile();
      this.getAllFriends();
    },
    next() {
      this.$router.push("/addfriend");
    },
    getAllFriends() {
      request
        .get("/profile/friendList", {
          params: {
            profileID: this.profile.id,
          },
        })
        .then((res) => {
          console.log(res);
          this.friendTableData = res.data;
          // console.log(this.friendTableData.forEach(e=>{console.log(e)}));
        });
    },
  },
};
</script>

<style scoped>
.content {
  width: 100%;
  height: 120vh;
  overflow: hidden;
  position: relative;
}
.logo_and_title {
  width: 400px;
  height: 120px;
  text-align: center;
  padding-left: 37%;
  padding-top: 2%;
  position: absolute;
  /*padding-left: 600px;*/
  /*padding-top: 60px;*/
}
.logo_and_title img {
  width: 80px;
}
.logo_and_title h1 {
  width: 300px;
}
/*------------My Profile---------------*/
.myprofile_container {
  /* background: url('jack-finnigan-M9EctVUPrp4-unsplash.jpg') no-repeat center center fixed; */

  height: 1000px;
  position: absolute;
  padding-left: 33%;
  padding-top: 7%;
  /* background-color: #f3e6f7; */
  /* padding: 50px; */
  /* background-color: azure; */
}

.myprofile_form {
  width: 540px;
  height: 800px;
  /* border: 2px solid red; */
  margin: 20px auto;
  text-align: center;
  border: solid 2px;
  border-color: #864a98;
  border-radius: 5px;
}
.myprofile_form_header p {
  font-size: 28px;
  font-weight: bold;
  color: #864a98;
  text-align: center;
}

.myprofile_display_container {
  width: 440px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 460px;
  border: solid 2px #bfa0c8;
  border-radius: 5px;
  margin-left: 50px;
}

.myprofile_display_container::-webkit-scrollbar {
  width: 10px;
}
.myprofile_display_container::-webkit-scrollbar-thumb {
  background-color: #bfa0c8;
  border-radius: 5px;
}
.myprofile_display_container::-webkit-scrollbar-button {
  display: none;
}
.myprofile_display_container::-webkit-scrollbar-track {
  background-color: #f3f3f3;
}

.myprofile_display {
  height: 480px;
  width: 400px;
  margin-left: 70px;
  border: dotted;
  border-radius: 5px;
  border-width: 2px;
  border-color: #864a98;
}

.myprofile_display_content {
  width: 400px;
  height: 120px;
  background-color: #f3f3f3;
  margin-bottom: 10px;
  margin-left: 15px;
  margin-top: 10px;
  cursor: pointer;
}
.myprofile_display_content:hover {
  width: 400px;
  height: 120px;
  border: solid 2px #bfa0c8;
  background-color: #f3f3f3;
  margin-bottom: 10px;
  margin-left: 15px;
  margin-top: 10px;
  cursor: pointer;
}
.myprofile_display_content img {
  width: 100px;
  height: 100px;
}

.myprofile_display_content td {
  width: 180px;
  height: 120px;
}
.myprofile_display_content p {
  font-size: 18px;
  color: #864a98;
  font-weight: bold;
}

.myprofile_talk_to_sb_new {
  width: 400px;
  height: 120px;
  background-color: #f3e6f7;
  margin-bottom: 10px;
  margin-left: 15px;
  margin-top: 20px;
  cursor: pointer;
}
.myprofile_talk_to_sb_new:hover {
  width: 400px;
  height: 120px;
  border: solid 2px #bfa0c8;
  background-color: #f3e6f7;
  margin-bottom: 10px;
  margin-left: 15px;
  margin-top: 20px;
  cursor: pointer;
}
.myprofile_talk_to_sb_new img {
  width: 100px;
  height: 100px;
}

.myprofile_talk_to_sb_new td {
  width: 180px;
  height: 120px;
}

.myprofile_talk_to_sb_new p {
  font-size: 16px;
  color: #864a98;
  font-weight: bold;
}

.myprofile_addfriend {
  height: 50px;
  margin-bottom: 30px;
}

.myprofile_addfriend button {
  height: 42px;
  width: 430px;
  background-color: white;
  border: solid 2px;
  margin-left: 6px;
  margin-top: 15px;
  font-size: 18px;
  color: #bfa0c8;
  border-radius: 5px;
  cursor: pointer;
}
.myprofile_addfriend button:active {
  height: 42px;
  width: 430px;
  background-color: #bfa0c8;
  border: solid 2px;
  margin-left: 6px;
  margin-top: 15px;
  font-size: 18px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.myprofile_switch {
  margin-left: 50px;
}
#videocall_btn {
  height: 44px;
  width: 255px;
  background-color: #bfa0c8;
  color: white;
  border: 0px;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
}
#videocall_btn:hover {
  height: 44px;
  width: 255px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#videocall_btn:active {
  height: 44px;
  width: 255px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#me_btn {
  height: 44px;
  width: 175px;
  background-color: #bfa0c8;
  color: white;
  border: 0px;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
}
#me_btn:hover {
  height: 44px;
  width: 175px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#me_btn:active {
  height: 44px;
  width: 175px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}

.select-border {
  border: black 2px solid;
}
</style>
