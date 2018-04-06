import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import {withRouter} from 'react-router-dom'
import swal from 'sweetalert2'
import { envURL, reactURL } from '../config/environment';

class CardDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            cardHolderName: '',
            cardNumber: '',
            expMonth:'',
            expYear:'',
            cardCVV:''
        }
    }

    componentWillMount(){
      
    }

    handleUserInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value },
            () => { this.validateField(name, value) });
    }

    handleSubmit() {     
        let addMoneyAPI=envURL+'addMoney';
        //alert("abc");
        let user_id = localStorage.getItem('id');
        let name = this.state.cardHolderName;
        let amount = this.state.amount;
        let cardNumber = this.state.cardNumber;
        let expMonth = this.state.expMonth;
        let expYear = this.state.expYear;
        let cardCVV = this.state.cardCVV;
        let payment_date = new Date().toDateString();
        if (!name || !user_id || !amount || !cardNumber || !expMonth || !expYear || !cardCVV) {
            swal({
                type: 'error',
                title: 'Payment',
                text: "Complete payment form",
              })
            return;
        }

        if(cardNumber.length >16){
            swal({
                type: 'error',
                title: 'Payment',
                text: "Invalid Card Number",
              })
            return;
        }
        if(cardCVV.length !=3){
            swal({
                type: 'error',
                title: 'Payment',
                text: "Invalid Card  CVV Number",
              })
            return;
        }
        if(cardNumber.length !=16){
            swal({
                type: 'error',
                title: 'Payment',
                text: "Invalid Card Number",
              })
            return;
        }
        var apiPayload = {user_id:user_id,name:name,amount:amount,cardNumber:cardNumber,
            expMonth:expMonth,expYear:expYear,cardCVV:cardCVV,payment_date:payment_date};
         axios.post(addMoneyAPI, apiPayload, {withCredentials:true}) 
            .then(res => {
                // eslint-disable-next-line
                if(res.data.errorMsg!=''){
                    swal({
                        type: 'error',
                        title: 'Add Money',
                        text: res.data.errorMsg,
                      })
                }else{
                    alert('Success')
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    handleUserInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value })
    }
    render() {
        return (
            

<form class="form-horizontal" role="form">
    <fieldset>
      <legend>Add Money</legend>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="card-holder-name">Amount</label>
        <div class="col-sm-9">
          <input type="number" class="form-control" name="amount" id="card-holder-name" placeholder="Enter Amount"
          value={this.state.amount} onChange={this.handleUserInput} />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="card-holder-name">Name on Card</label>
        <div class="col-sm-9">
          <input type="text" class="form-control" name="cardHolderName" id="card-holder-name" placeholder="Card Holder's Name"
          value={this.state.cardHolderName} onChange={this.handleUserInput} />
        </div>
      </div>
      
      <div class="form-group">
        <label class="col-sm-3 control-label" for="card-number">Card Number</label>
        <div class="col-sm-9">
          <input type="number" class="form-control" name="cardNumber" id="card-number" placeholder="Debit/Credit Card Number"
          value={this.state.name} onChange={this.handleUserInput} />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="expiry-month">Expiration Date</label>
        <div>
        <div class="col-sm-9">
            <div class="col-xs-5">
              <select class="form-control col-sm-2" 
              value={this.state.expMonth} onChange={this.handleUserInput}  name="expMonth" id="expiry-month">
                <option>Month</option>
                <option value="01">Jan (01)</option>
                <option value="02">Feb (02)</option>
                <option value="03">Mar (03)</option>
                <option value="04">Apr (04)</option>
                <option value="05">May (05)</option>
                <option value="06">June (06)</option>
                <option value="07">July (07)</option>
                <option value="08">Aug (08)</option>
                <option value="09">Sep (09)</option>
                <option value="10">Oct (10)</option>
                <option value="11">Nov (11)</option>
                <option value="12">Dec (12)</option>
              </select>
            </div>
            <div class="col-xs-5">
              <select class="form-control col-sm-2" name="expYear" 
              value={this.state.expYear} onChange={this.handleUserInput} >
                <option value="18">2018</option>
                <option value="19">2019</option>
                <option value="20">2020</option>
                <option value="21">2021</option>
                <option value="22">2022</option>
                <option value="23">2023</option>
                <option value="22">2024</option>
                <option value="23">2025</option>              
              </select>
            </div>
          </div>
          </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="cvv">Card CVV</label>
        <div class="col-sm-3">
          <input type="password" class="form-control" name="cardCVV" id="cvv" placeholder="Security Code"
          value={this.state.cardCVV} onChange={this.handleUserInput} />
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-offset-3 col-sm-9">
          <button type="button" class="btn btn-success" onClick={this.handleSubmit.bind(this)} >Add Money</button>
        </div>
      </div>
    </fieldset>
  </form>  
        )
    }
}


export default withRouter(CardDetails);