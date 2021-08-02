<template>
<section class="confirm-line-haul-connection">
  <div class="animated fadeInDown">
    <br>
    <vue-element-loading spinner="line-scale" color="#FF6700" :active.sync="isLoading" is-full-screen />
    <fieldset>
      <div class="card-body1" style="width:50%;margin-left: 25%;">
        <form v-on:submit.prevent="onSubmit">
          <legend>
            <center>Sign In</center>
          </legend><br>
          <fieldset style="border:1px solid black;background-color: #ffffff;padding-top: 50px;padding-right: 40px;  padding-left: 40px; padding-bottom:20px">
            <div class="form-group row">
              <div class="col-md-6">
                <label>Email</label>
                <input ref="email" type='email' v-model="email" v-bind:class="{'form-control': true }" name="email" placeholder="Enter MailId">
              </div>
            </div>
            <div class="form-group row">
              <div class="col-md-6">
                <label>Password</label>
                <input ref="password" type='password' v-model="password" v-bind:class="{'form-control': true }" name="password" placeholder="Enter password">
              </div>
            </div>
            <div class="row" style="float:right">
              <button type="submit" @click="loginUser()" class="btn btn-primary">Sign In</button>&nbsp;&nbsp;
              <button type="reset" @click="resetForm" class="btn btn-danger">Reset</button>
            </div><br><br>
            <div class="row" style="float:right">
              <p class="forgot-password text-right">
                Create User
                <router-link :to="{name: 'signup'}">sign up?</router-link>
              </p>
            </div>
          </fieldset>
        </form>
      </div>
      <div class="card-body1" v-if="showTable==true">
        <legend>Shipment Details</legend>
        <vue-element-loading spinner="line-scale" color="#FF6700" :active.sync="isLoadingSearch" />
        <div style="overflow: auto; height: 200px;margin-top: 20px;">
          <table class="table-bordered table-hover tbl datatables" style="width:100%;">
            <thead>
              <tr class="text-primary">
                <th class="text-center tableheader">shippingID</th>
                <th class="text-center tableheader">Shipment Status</th>
                <th class="text-center tableheader">Status</th>
                <th class="text-center tableheader">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">{{shipmentDetails.shippingid}}</td>
                <td class="text-center">{{shipmentDetails.shipmentstatus}}</td>
                <td class="text-center">{{shipmentDetails.status}}</td>
                <td class="text-center">
                  <span class="badge badge-success" style="cursor: pointer;" @click="ConfirmShipmentShortageMark">Mark Shortage</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </fieldset>
  </div>
</section>
</template>

<script>
import axios from 'axios'
import Paginate from 'vuejs-paginate'
import {
  Validator
} from 'vee-validate'
import DatePicker from 'vue2-datepicker'
import CryptoJS from 'crypto-js';
import moment from 'moment'
import {
  BasicSelect
} from 'vue-search-select';
import VueElementLoading from 'vue-element-loading';
import Printd from 'printd'

export default {
  components: {
    VueElementLoading
  },
  data() {
    return {
      email: "",
      password: "",
      userid: '',
      hubName: "",
      showTable: false,
      isLoadingSearch: false,
      isLoading: false,
      isDisplay: true,
      shippingid: "",
      shipmentDetails: {
        shippingid: "",
        shipmentstatus: "",
        status: ""
      },
      ConfirmShipmentShortage: false,
      isDisabledOK: false
    }
  },
  filters: {
    moment: function(date) {
      if (date == null || date == '')
        return '--'
      return moment(date).format('DD-MM-YYYY HH:mm:ss');
    }
  },
  methods: {
    loginUser() {
      this.input = {
        email: this.email,
        password: this.password
      }
      axios({
          method: 'POST',
          url: 'http://localhost:8000/api/loginUser',
          data: this.input,
        })
        .then(result => {
          console.log(result)
          if (result.data.ResultCode == 100) {
            this.userid = result.data.ResponseData
            let path = this.$router.resolve("/Dashboard/" + this.userid)
            window.open(path.href, '_self');
          } else {
            alert('ND')
          }
        }, error => {
          console.error(error)
        })
    },
    onSubmit: function() {},
    loadShipmentDetails() {
      this.isLoadingSearch = true
      this.input = {}
      axios({
          method: 'GET',
          'url': apiUrl.allocateRuleapi_url + 'getShipmentDetailsToMarkShortage?ShippingID=' + this.shippingid,
          headers: {
            'Authorization': 'authkey xB84JJ89Hd25'
          }
        })
        .then(result => {
          var response = result.data
          if (response.ResultCode == 100) {
            if (response.ResponseData) {
              this.isLoadingSearch = false;
              this.showTable = true;
              this.shipmentDetails = response.ResponseData;
            }
          } else {
            this.shipmentDetails = {};
            this.isLoadingSearch = false;
            this.showTable = false;
            this.$alertify.error(result.data.ReturnMessage)
          }
          this.isLoading = false
        }, error => {
          console.log(error)
        })
    },
    ConfirmShipmentShortageMark() {
      this.ConfirmShipmentShortage = true;
    },
    CloseConfirmation() {
      this.ConfirmShipmentShortage = false;
    },
    MarkShipmentShortage(shipmentDetails) {
      this.isDisabledOK = true
      this.input = ({
        "processLocation": this.hubId,
        "shipmentStatus": shipmentDetails.shipmentstatus,
        "status": shipmentDetails.status,
        "lastModifiedBy": this.useremail,
        "shippingId": shipmentDetails.shippingid,
        "isManualEntry": false,
        "shipmentCurrentHub": shipmentDetails.currenthubid
      });
      axios({
          method: 'POST',
          'url': apiUrl.api_url_hubops + 'markShipmentShortage',
          'data': this.input,
          headers: {
            'authorization': 'authkey xB84JJ89Hd25'
          }
        })
        .then(result => {
          this.isDisabledOK = false
          if (result.data.ResultCode == 100) {
            this.$alertify.success(result.data.ReturnMessage)
            this.ConfirmShipmentShortage = false;
            this.resetForm()
          } else {
            this.$alertify.error(result.data.ReturnMessage);
            this.ConfirmShipmentShortage = false;

          }
        }, error => {
          console.error(error)
        })
    },
    resetForm() {
      this.isDisabledOK = false
      this.shippingid = "";
      this.shipmentDetails = {};
      this.isLoadingSearch = false;
      this.showTable = false;
      this.$validator.reset();
      this.errors.clear();
    },
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
  margin-bottom: 0px !important;
}

.card-header {
  padding: 0.75rem 1.25rem;
  border-bottom-color: #f0f3f5;
  height: 40px;
}
</style>
