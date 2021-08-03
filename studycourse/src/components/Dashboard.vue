<template>
<section class="dashboard">
  <div class="animated fadeInDown">
    <br>
    <div class="container-fluid">
      <fieldset>
        <div class="lclass">
          <h5 style="float:left">Dashboard</h5>
          <button type="button" @click="logOut()" style="float:right" class="btn btn-primary">LogOut</button>
        </div><br><br>
        <div class="card-body1">
          <fieldset style="border:1px solid black;background-color: #ffffff;padding-top: 50px;padding-right: 40px;  padding-left: 40px; padding-bottom:20px">
            <div class="row" style="height:300px; overflow:auto">
              <div class="col-md-12">
                <template>
                  <table class="b-table table table-bordered">
                    <thead class="thead-default">
                      <tr class="text-primary">
                        <th class="text-center tableheader">#</th>
                        <th class="text-center tableheader">Subject</th>
                        <th class="text-center tableheader">Status</th>
                        <th class="text-center tableheader">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(data,index) in studyData" v-bind:key="data.id">
                        <td scope="row" class="text-center">{{index+1}}</td>
                        <td class="text-center">{{data.subject}}</td>
                        <th class="text-center tableheader">{{data.status}}</th>
                        <td class="text-center"><span style="color:red; cursor:pointer" @click="openPDF(data)">open</span></td>
                      </tr>
                      <tr v-if="(studyData && studyData.length==0) || studyData.length==0">
                        <td class="text-center" colspan="8">No Data Found</td>
                      </tr>
                    </tbody>
                  </table>
                </template>
              </div>
            </div>
          </fieldset>
        </div>
      </fieldset>
    </div>
  </div>
</section>
</template>

<script>
import axios from 'axios'



export default {
  components: {
  },
  data() {
    return {
      listCount: 0,
      userid: '',
      pageNo: 0,
      pageCount: 0,
      studyData: [],
    }
  },
  mounted() {
    this.userid = this.$route.params.userid;
    this.getStudyMaterailList();
  },
  created() {

    window.addEventListener('beforeunload', () => {
      this.logOut();
    });

  },
  methods: {
    getStudyMaterailList() {
      axios({
          method: 'GET',
          url: 'http://localhost:8000/api/getStudyMaterial?userId=' + this.userid,
        })
        .then(result => {
          if (result.data.ResultCode == 100) {
            this.studyData = result.data.ResponseData;
          } else {
            alert(result.data.ReturnMessage)
          }
        }, error => {
          console.error(error)
        })
    },
    logOut() {
      let log = [];

      this.studyData.map(item => {
        if (localStorage.getItem(item.smid)) {
          log.push({
            smid: item.smid,
            timeleft: localStorage.getItem(item.smid)
          })
        }
        localStorage.removeItem(item.smid);
      })

      this.input = {
        userId: this.userid,
        log: log
      }

      axios({
          method: 'POST',
          url: 'http://localhost:8000/api/createUserLog',
          data: this.input
        })
        .then(result => {
          if (result.data.ResultCode == 100) {
            let path = this.$router.resolve("/")
            window.open(path.href, '_self');
          } else {
            console.log("Not done")
          }
        }, error => {
          console.error(error)
        })
    },
    openPDF(data) {
      let path = this.$router.resolve("/StudyMaterial/" + data.smid + "/" + this.userid)
      window.open(path.href, '_blank');
    }
  }
}
</script>
<style>
label {
  font-weight: 500;
  color: black;
}

.form-control:focus {
  border-color: #7BE855;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(123, 232, 85, .6);
}

.form-control.error {
  border-color: #E84444;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(232, 68, 68, .6);
}

legend {
  padding: 0.2em 0.5em;
  border: 1px solid #b0b2b3;
  border-bottom: 0px solid #b0b2b3;
  color: black;
  font-size: 16px;
  background-color: #ffffff;

}

.lclass {
  padding: 0.2em 0.5em;
  border: 1px solid #b0b2b3;
  border-bottom: 0px solid #b0b2b3;
  height: 35px;
  color: black;
  font-size: 16px;
  background-color: #ffffff;

}

th {
  font-size: 13px;
  font-family: Roboto, sans-serif;
}

td {
  padding: 5px;
  font-size: 12px;
  font-family: Roboto, sans-serif;
}

.card-header {
  padding: 0.75rem 1.25rem;
  border-bottom-color: #f0f3f5;
  height: 40px;
}

#the-canvas {
  border: 1px solid black;
  direction: ltr;
}
</style>
