<template>
  <WisdomHeader></WisdomHeader>
  <div class="container">
    <div
      class="conference_settings_background"
      id="conference_settings_background"
    >
      <div class="conference_settings">
        <div class="conference_settings_container">
          <h2>Video Call</h2>

          <!--get name method--->
          <div class="label">name</div>
          <input type="text" id="your_name" :value=name /><br />

          <div class="label">Bandwidth</div>
          <select id="bandwidth">
            <option value="1920">Maximum Bandwidth (1920kbps)</option>
            <option value="1280">High Bandwidth (1280kbps)</option>
            <option value="576">Medium Bandwidth (576kbps)</option>
            <option value="192">Low Bandwidth (192kbps)</option></select
          ><br />

          <button @click="doCall(room)">Join Now</button>
        </div>
      </div>
    </div>

    <!--can keep this part--->
    <div class="conference_video_container" id="conference_video_container">
      <div class="conference_video">
        <video id="video" autoplay="autoplay"></video>
      </div>

      <div class="conference_selfview">
        <video id="selfview" autoplay="autoplay" muted="true"></video>
      </div>

      <div class="chat_box" id="chat_box">
        <div class="chat_content">
          <div class="chat_content_text" id="chat_content_text"></div>
        </div>
        <div class="chat_message">
          <div class="chat_close" @click="closeChat()">
            <i class="fas fa-times"></i>
          </div>
          <input type="text" value="" id="chat_message" />
          <button @click="sendMessage()">Send</button>
        </div>
      </div>

      <div class="controls">
        <div class="control" @click="muteToggle()" id="mute_button">
          <i class="fas fa-microphone-slash"></i>
        </div>
        <!--add a method in endCall, send status to backend--->
        <div class="control" @click="endCall()">
          <i class="fas fa-phone-slash"></i>
        </div>
        <div class="control" @click="showChat()">
          <i class="fas fa-comment-dots"></i>
        </div>
        <div class="control" @click="switchCamera()">
          <i class="fas fa-exchange-alt"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";
import WisdomHeader from "@/components/WisdomHeader.vue";
import {
  closeChat,
  muteToggle,
  sendMessage,
  endCall,
  showChat,
  switchCamera,
  doCall,
  getMediaDevices
} from "../utils/webui.js";

export default {
  name: "InterestListRemove",
  data() {
    return {
      websocket: null,
      webSocketURL: "ws://ericbackend.azurewebsites.net/chat",
      // webSocketURL: "ws://localhost:9090/chat/",
      oncall: false,
      roomId: null,

      form: {},
      query: "",
      search: "",
      hobbyTableData: [],
      room : '',
      password : '',
      name:'',
      configuration: {
        video: {
          height: {
            min: 1080,
          },
          width: {
            min: 1920,
          },
        },
        audio: true,
      },
      profile: localStorage.getItem("profile")
        ? JSON.parse(localStorage.getItem("profile"))
        : null,
      user : localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    };
  },
  
  computed: {
    sliceList() {
      return function (data, count) {
        if (data != undefined) {
          let index = 0;
          let arrTemp = [];
          for (let i = 0; i < data.length; i++) {
            index = parseInt(i / count);
            if (arrTemp.length <= index) {
              arrTemp.push([]);
            }
            arrTemp[index].push(data[i]);
          }
          return arrTemp;
        }
      };
    },
  },
  created() {
    this.load();
    this.setOncall();

    this.roomId = this.$route.query.roomId;
    // console.log(this.profile);
    this.room = this.$route.query.room;
    // this.password = this.$route.params.password;
    this.name = JSON.parse(localStorage.getItem("profile")).username;
    console.log(this.name);
    console.log(this.room);
    // test();
  },

  destroyed() {
    this.websocket.close();
    if (this.oncall){
      console.log("des")
      this.chatClose()
    }
  },

  mounted() {
    getMediaDevices(this.configuration)
    
  },
  methods: {
    //websocket
    chatClose(){

      // call form is used to build websocket request
      let callForm = {};
      // sender is current user's profile id
      callForm.sender = this.profile.id
      // receiver is used to save the chat room id
      callForm.receiver = this.roomId
      // message = 2 is means this is a call disacceptance websocket request
      callForm.message = "2"
      this.releaseConferenceRoom();
      this.websocketSend(JSON.stringify(callForm))
      this.state = 'no call';
      this.oncall = false;
      this.roomId = null;
      this.message = null;
      this.dialogChatVisible1 = false;
      this.dialogChatVisible2 = false;
    },

    initialWebSocket() {
      this.webSocketURL =
          "ws://ericbackend.azurewebsites.net/chat/" + this.user.token + "/" + this.profile.id;
          // "ws://localhost:9090/chat/" + this.user.token + "/" + this.profile.id;
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

    websocketOnOpen() {
    },

    websocketOnError() {
      // ????????????????????????
      this.initialWebSocket()
    },
    websocketOnMessage(e) {
      // receive websocket reply or broadcast message
      let res = JSON.parse(e.data)
      console.log('receive: ', res)
      if (res.isSystem){ //friend online offline notifications; broadcast message
      }else {
        if (res.isGetRoomID){ // room build, receive chat room id; Be attention Chat room is different with pxiep conference node room

        }else { //accept or refuse call feedback message
          if(res.message == 1){ //accept

          }else { //refuse
            this.$router.push({
              path: "/taponfriend",
              query: {
              },
            });
          }
        }
      }
    },
    websocketSend(Data) {

      this.websocket.send(Data)
    },
    websocketClose(e) {

      console.log('close connection', e)
    },

    //set oncall state to be 1
    setOncall(){
      let friendRequestForm;
      friendRequestForm = {};

      friendRequestForm.profileID = this.profile.id;
      friendRequestForm.targetID = 1;
      request.put("/profile/oncall", friendRequestForm).then(res => {
        if (res.code === '200') {
          this.$message({
            type: "success",
            message: "successfully reset Oncall"
          })
          this.initialWebSocket();

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

    // get conference room
    releaseConferenceRoom(){
      let releaseRoomRequestForm;
      releaseRoomRequestForm = {};

      releaseRoomRequestForm.profileID = this.profile.id;
      releaseRoomRequestForm.targetID = null;
      request.post("/conference/releaseRoom", releaseRoomRequestForm).then(res =>{
        // console.log(res);
        if (res.code === '200') {
          this.conferenceRoom = null;
          this.conference = null;
          this.pin = null;
          this.$message({
            type: "success",
            message: "successfully release a room"
          })

        } else {
          this.$message({
            type: "error",
            message: res.msg
          })
        }
      })
    },



    doCall(room) {
      doCall(room);
    },
    closeChat() {
      closeChat();
    },
    sendMessage() {
      sendMessage();
    },
    muteToggle() {
      muteToggle();
    },
    endCall() {
      // ?????? ???????????????
      endCall();
      this.chatClose();
      this.websocket.close();

      this.$router.push({
        path: "/taponfriend",
        query: {
        },
      });
    },
    showChat() {
      showChat();
    },
    switchCamera() {
      switchCamera();
    },
    refreshProfile() {
      this.profile = localStorage.getItem("profile")
        ? JSON.parse(localStorage.getItem("profile"))
        : {};
    },
    load() {
      this.refreshProfile();
    },
  },
  components: { WisdomHeader },
};
</script>

<style scoped>
body {
  padding: 0;
  margin: 0;

  font-family: Arial;

  background-color: white;
}

.conference_settings_background {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  position: fixed;

  background-color: white;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.conference_settings {
  width: 500px;
  height: 400px;

  background-color: white;
  border: solid 2px;
  border-color: #864a98;
  border-radius: 5px;

  padding: 10px;

  display: flex;
  justify-content: center;
}

.conference_settings_container {
  width: 400px;
  margin-left: 24px;
}
.conference_settings_container h2 {
  font-size: 28px;
  font-weight: bold;
  color: #864a98;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 20px;
}

.conference_settings .label {
  padding-left: 5px;
  margin-bottom: 10px;
  margin-top: 20px;
}

.conference_settings input[type="text"] {
  height: 40px;
  width: 360px;
  border: 2px solid;
  font-size: 18px;
  border-radius: 5px;
  border-color: #bfa0c8;
  outline: none;
}

.conference_settings select {
  height: 44px;
  width: 370px;
  border: 2px solid;
  font-size: 18px;
  border-radius: 5px;
  border-color: #bfa0c8;
  outline: none;
}

.conference_settings button {
  height: 44px;
  width: 370px;
  background-color: #bfa0c8;
  color: white;
  border: 0px;
  /* margin-top: 45px; */
  margin-top: 40px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
}

.conference_settings button:hover {
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  /* margin-top: 45px; */
  border-radius: 5px;
  cursor: pointer;
}

.conference_video {
  height: 100vh;

  display: flex;
}

.conference_video video {
  height: 100vh;
  z-index: -99;
}

.conference_selfview {
  width: 200px;
  height: 100px;

  position: absolute;
  left: 10px;
  top: 10px;
}

.conference_selfview video {
  width: 200px;
}

.chat_box {
  display: none;
  flex-direction: column;
  position: fixed;

  align-items: center;
  justify-content: center;

  left: 0;
  top: 50%;

  height: 500px;

  width: 300px;
  margin-top: -250px;

  background-color: #fff;

  border-radius: 0px 5px 5px 0px;
  padding: 10px;
}

.chat_content {
  display: flex;
  flex: 1;
  width: 100%;
}

.chat_content_text {
  align-self: flex-end;
}

.chat_message {
  padding: 10px;
}

.chat_close {
  position: absolute;
  right: 20px;
  top: 10px;
  font-size: 30px;
}

.chat_close:hover {
  cursor: pointer;
}

.controls {
  position: fixed;
  bottom: 0;
  left: 50%;

  width: 300px;
  height: 50px;
  margin-left: -150px;
  padding: 5px;

  border-radius: 5px 5px 0px 0px;

  background-color: #fff;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 25px;
}

.control {
  padding: 5px;
}

.control:hover {
  cursor: pointer;
  color: #ccc;
}

.conference_video_container {
  display: none;

  align-content: center;
  justify-content: center;
}
</style>
