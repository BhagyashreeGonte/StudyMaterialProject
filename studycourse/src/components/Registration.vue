<template>
<section class="create-user">
  <div class="animated fadeInDown">
    <br>
    <fieldset>
      <div class="card-body1" style="width:50%;margin-left: 25%;">
        <form v-on:submit.prevent="onSubmit">
          <legend> <center>Sign Up</center></legend><br>
          <fieldset style="border:1px solid black;background-color: #ffffff;padding-top: 50px;padding-right: 40px;  padding-left: 40px; padding-bottom:20px">
              <div class="form-group row">
                <div class="col-md-4">
                      <label>First Name</label>
                      <input ref="fname" v-model="fname" v-bind:class="{'form-control': true }" name="fname" placeholder="Enter First Name" v-validate="{required:true}">
                      <span v-show="errors.has('fname')" class="text-danger">First Name field is required.</span>
                </div>
                <div class="col-md-4">
                      <label>Middle Name</label>
                      <input ref="mname" v-model="mname" v-bind:class="{'form-control': true }" name="mname" placeholder="Enter Middle Name" v-validate="{required:true}">
                      <span v-show="errors.has('mname')" class="text-danger">Middle Name field is required.</span>
                </div>
                <div class="col-md-4">
                      <label>Last Name</label>
                      <input ref="lname" v-model="lname" v-bind:class="{'form-control': true }" name="lname" placeholder="Enter Last Name" v-validate="{required:true}">
                      <span v-show="errors.has('lname')" class="text-danger">Last Name field is required.</span>
                </div>
                </div>
                <div class="form-group row">
                  <div class="col-md-6">
                        <label>Email</label>
                        <input ref="email" type='email' v-model="email" v-bind:class="{'form-control': true }" name="mail" placeholder="Enter MailId" v-validate="{required:true}">
                        <span v-show="errors.has('mail')" class="text-danger">EmailID field is required.</span>
                  </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-md-6">
                          <label>Mobile No</label>
                          <input ref="mobile" v-model="mobile" v-bind:class="{'form-control': true }" name="mobile" placeholder="Enter Mobile" v-validate="{required:true}">
                          <span v-show="errors.has('mobile')" class="text-danger">Mobile field is required.</span>
                    </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-md-6">
                            <label>Password</label>
                            <input ref="password" type= "password" v-model="password" v-bind:class="{'form-control': true }" name="password" placeholder="Enter password" v-validate="{required:true}">
                            <span v-show="errors.has('password')" class="text-danger">Password field is required.</span>
                      </div>
                      </div>
                <div class="row" style="float:right">
                  <button type="submit" class="btn btn-primary">Sign Up</button>&nbsp;&nbsp;
                  <button type="reset" @click="resetForm" class="btn btn-danger">Reset</button>
                </div><br><br>
                <div class="row" style="float:right">
                <p class="forgot-password text-right">
                    Already registered
                    <router-link :to="{name: 'login'}">sign in?</router-link>
                </p>
                </div>
              </fieldset>
        </form>
      </div>
    </fieldset>
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
        fname:"",
        mname:"",
        lname:"",
        mobile:"",
        email:"",
        password:""
        }
      },
      methods: {
      onSubmit: function() {
  			this.$validator.validateAll()
  				.then((result) => {
  					if (!result) {
  						return false;
  					} else {
  						this.createUser();
  					}
  				}).catch(() => {
  					console.log('errors exist', this.errors);
  				});
  		},

    		createUser(){
        this.input = {
        firstName: this.fname,
        middleName: this.mname,
        lastName: this.lname,
        email: this.email,
        mobile: this.mobile,
        password: this.password
        }
        axios({
            method: 'POST',
            url: 'http://localhost:8000/api/registerUser',
            data:this.input
          })
          .then(result => {
            if (result.data.ResultCode == 100) {
            this.$alertify.success(result.data.ReturnMessage)
            this.resetForm();
            } else {
              this.$alertify.error(result.data.ReturnMessage)
            }
          }, error => {
            console.error(error)
          })
    		},
    		resetForm() {
    			this.fname = "";
			this.mname = "";
			this.lname = "";
			this.email = "";
			this.mobile = "";
			this.password = "";
	    this.$validator.reset();
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
  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(123,232,85,.6);
}

.form-control.error {
  border-color: #E84444;
  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(232,68,68,.6);
}

legend {
  padding: 0.2em 0.5em;
  border: 1px solid #b0b2b3;
  border-bottom: 0px solid #b0b2b3;
  color: black;
  font-size: 16px;
  background-color: #ffffff;
  margin-bottom: 0px!important;
}

th {
  font-size: 13px;
  font-family: Roboto,sans-serif;
}

td {
  padding: 5px;
  font-size: 12px;
  font-family: Roboto,sans-serif;
}
.card-header {
  padding: 0.75rem 1.25rem;
  border-bottom-color: #f0f3f5;
  height: 40px;
}

</style>
