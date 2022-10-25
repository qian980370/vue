<template>
  <Wisdom-header></Wisdom-header>




  <div class="more_interests_container">
    <div class="more_interests_form">
      <div class="more_interests_form_header">
        <table class="interests_form_header_table">
          <tr>
            <td><div class="back_button" @click="$router.push('/interestlist')"><img src="../image/back_icon.png" style="height: 30px;" alt="back_icon"></div></td>
            <td><p>Add Interests</p></td>
          </tr>
        </table>
      </div>

      <hr>

      <div class="more_interests_display_header"><p>Click to add in your list</p></div>
      <div class="interests_display_container">
        <div class="interests_display_content">
          <table>
            <tr v-for="(row,index) in sliceList(randomHobbyTableData,3)" :key="index">
              <td v-for="(data,i) in row " :key="i">
                <div class="interests_display_content_img">
                  <img :src="src/image/add_icon.png">
                  <button id="more_interest_btn"  @click="addHobby(data.id)"></button>
                </div>
                <p>{{data.name}}</p>
              </td>
            </tr>
          </table>
        </div>





    </div>


    </div>
  </div>


</template>

<script>
import request from "@/utils/request";
import WisdomHeader from "@/components/WisdomHeader.vue";

export default {
    name: "MoreInterest",
    data() {
        return {
            form: {},
            query: "",
            search: "",
            randomHobbyTableData: [],
            profile: localStorage.getItem("profile") ? JSON.parse(localStorage.getItem("profile")) : null,
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
        }
    },
    created() {
        this.load();
        console.log(this.profile);
    },
    methods: {
        refreshProfile() {
            this.profile = localStorage.getItem("profile") ? JSON.parse(localStorage.getItem("profile")) : {};
            // console.log(this.profile);
            this.privacy = this.profile.privacy;
        },
        load() {
            this.refreshProfile();
            this.getRandomHobbies();
        },
        getRandomHobbies() {
            request.get("/hobby/randomHobbies", {
                params: {
                    profileID: this.profile.id,
                }
            }).then(res => {
                console.log(res);
                this.randomHobbyTableData = res.data;
            });
        },
        addHobby(id) {
            let friendRequestForm;
            friendRequestForm = {};
            friendRequestForm.profileID = this.profile.id;
            friendRequestForm.targetID = id;
            request.post("/hobby/addHobby", friendRequestForm).then(res => {
                if (res.code === "200") {
                    this.$message({
                        type: "success",
                        message: "successfully add hobby"
                    });
                    this.load();
                }
                else {
                    this.$message({
                        type: "error",
                        message: res.msg
                    });
                }
            });
        },
    },
    components: { WisdomHeader }
}
</script>

<style scoped>
#logo_and_title{
  width: 400px;
  height: 120px;
  text-align: center;
  padding-left: 37%;
  padding-top: 2%;
}
.more_interests_container{
  /* background: url('jack-finnigan-M9EctVUPrp4-unsplash.jpg') no-repeat center center fixed; */

  height: 1000px;
  /* background-color: #f3e6f7; */
  /* padding: 50px; */
  /* background-color: azure; */
}
#more_interest_btn{
  position: relative;
  height: 30px;
  width: 30px;
  z-index: 20;
  left: 96px;
  background: url("../image/add_icon.png") no-repeat;
  background-size: 28px 28px;
  border: none;
}

.more_interests_form{
  width: 540px;
  height: 800px;
  /* border: 2px solid red; */
  margin:20px auto;
  text-align: center;
  border:solid 2px;
  border-color:#864a98;
  border-radius: 5px;
}
.more_interests_form_header{
  padding: 2rem 0;
}
.more_interests_form_header p{
  font-size: 28px;
  font-weight: bold;
  color:#864a98;
  text-align: center;
}
.interests_display_header{
  margin-top: 30px;

}

.more_interests_display_header{
  margin-top: 20px;
}
.more_interests_display_header p{
  font-size: 25px;
  font-weight: bold;
  color:#864a98;
  text-align: center;
}

.more_interests_display_container{
  width: 440px;
  overflow-y:auto;
  overflow-x: hidden;
  height: 460px;
  border: solid 2px #bfa0c8;
  border-radius: 5px;
  margin-left: 50px;
  margin-top: 40px;
}

.more_interests_display_container::-webkit-scrollbar{
  width: 10px;
}
.more_interests_display_container::-webkit-scrollbar-thumb{
  background-color: #bfa0c8;
  border-radius: 5px;
}
.more_interests_display_container::-webkit-scrollbar-button{
  display: none;
}
.more_interests_display_container::-webkit-scrollbar-track{
  background-color: #f3f3f3;
}


.interests_display{
  height: 480px;
  width: 400px;
  margin-left: 70px;
  border:dotted;
  border-radius: 5px;
  border-width:2px;
  border-color: #864a98;
}

.interests_display_content{
  width: 400px;
  height: 140px;
  margin-top: 20px;
  margin-bottom: 10px;
  margin-left: 15px;
}
.more_interests_display_content img{
  width: 100px;
  height: 100px;
  cursor: pointer;
  z-index: 0;
}
.interests_display_content img{
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.interests_display_content td{
  width: 240px;
  height: 160px;
}
.interests_display_content tr{
  padding-top: 40px;
}

.interests_display_content p{
  font-size: 14px;
  color:#864a98;
  font-weight: bold;
  text-align: center;
}

.more_interests_buttons{
  margin-left: 50px;
}

.more_interests_display_content_img{
  position: relative;
}

#add_interest_btn{
  position: absolute;
  height: 30px;
  width: auto;
  left: 96px;
}


#more_interests_add_btn{
  height: 44px;
  width: 215px;
  background-color: #bfa0c8;
  color: white;
  border: 0px;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#more_interests_add_btn:hover{
  height: 44px;
  width: 215px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#more_interests_add_btn:active{
  height: 44px;
  width: 215px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#more_interests_refresh_btn{
  height: 44px;
  width: 215px;
  background-color: #bfa0c8;
  color: white;
  border: 0px;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#more_interests_refresh_btn:hover{
  height: 44px;
  width: 215px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 70px;
  font-size: 18px;
  border-radius: 5px;
}
#more_interests_refresh_btn:active{
  height: 44px;
  width: 215px;
  background-color: white;
  color: #bfa0c8;
  border: solid 2px #bfa0c8;
  margin-top: 200px;
  font-size: 18px;
  border-radius: 5px;
}
.back_button{
  width: 80px;
  cursor: pointer;
}
</style>
