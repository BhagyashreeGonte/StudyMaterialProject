<template>
<section class="study-material">
  <div class="animated fadeInDown">
    <br>
    <div class="container-fluid">
      <fieldset>
        <div class="card-body1">
            <div class="lclass">
              <h5 style="float:left">{{subject}}</h5>
              <h4 style="float:right;margin-right:5%">Time Remaining:{{final}}</h4>
            </div><br><br>
            <fieldset style="border:1px solid black;background-color: #ffffff;padding-top: 50px;padding-right: 40px;  padding-left: 40px; padding-bottom:20px">
              <iframe ref='myframe' :src=pdfurl frameborder="0" height="450px" width="100%" id="myframe"></iframe><br><br>
              <div class="row" style="float:right">
                <button type="button" @click="addLog()" class="btn btn-primary" :disabled="isActive">Finish</button>
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
  name: 'StudyMaterial',
  data() {
    return {
      subject: '',
      smid: 0,
      userid: 0,
      isActive: true,
      count: 0,
      final: '',
      pdfurl: '',
      counter: 0,
    }
  },
  mounted() {

  var documentAtBottom = (document.documentElement.scrollTop + window.innerHeight) >= document.documentElement.scrollHeight;
    if (this.count == 0) {
      this.final = '00:00:00'
    }
    this.smid = this.$route.params.smid;
    this.userid = this.$route.params.userid;
    this.getPDFDetails();
    let counter = setInterval(() => {
      if (this.count > 0) {
        this.count--;
        localStorage.setItem(this.smid, this.count);
        this.final = this.formatTime(this.count);
      }
      if (this.count <= 0) {
        this.isActive = false
        return clearInterval(counter);
      }
    }, 1000);
  },
  methods: {
    addLog() {
      this.input = {
        userId: this.userid,
        subjectId: this.smid
      }
      axios({
          method: 'POST',
          url: 'http://localhost:8000/api/markStatusFinish',
          data: this.input
        })
        .then(result => {
          if (result.data.ResultCode == 100) {
            alert(result.data.ReturnMessage)
          } else {
            alert(result.data.ReturnMessage)
          }
        }, error => {
          console.error(error)
        })
    },
    formatTime(seconds) {
      var h = Math.floor(seconds / 3600),
        m = Math.floor(seconds / 60) % 60,
        s = seconds % 60;
      if (h < 10) h = "0" + h;
      if (m < 10) m = "0" + m;
      if (s < 10) s = "0" + s;
      return h + ":" + m + ":" + s;
    },
    getPDFDetails() {
      axios({
          method: 'GET',
          url: 'http://localhost:8000/api/getPDFDetails?subjectId=' + this.smid + '&userId=' + this.userid
        })
        .then(result => {
          if (result.data.ResultCode == 100) {
            this.pdfurl = result.data.ResponseData[0].url;
            if (!localStorage.getItem(this.smid)) {
              this.count = result.data.ResponseData[0].timespan;
            } else {
              this.count = localStorage.getItem(this.smid);
            }
            this.subject = result.data.ResponseData[0].subject;
          } else {
            alert(result.data.ReturnMessage)
          }
        }, error => {
          console.error(error)
        })
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
