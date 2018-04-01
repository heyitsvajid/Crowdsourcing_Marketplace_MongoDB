import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import { withRouter } from 'react-router-dom'
import swal from 'sweetalert2'

class BankDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            bankName: '',
            accountNumber: '',
            routingNumber: '',
        }
    }

    componentWillMount() {

    }

    handleUserInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value },
            () => { this.validateField(name, value) });
    }

    handleSubmit() {
        let addMoneyAPI = 'http://localhost:3001/withdrawMoney';
        //alert("abc");
        let user_id = localStorage.getItem('id');
        let name = this.state.bankName;
        let amount = this.state.amount;
        let accountNumber = this.state.accountNumber;
        let routingNumber = this.state.routingNumber;
        let payment_date = new Date().toDateString();
        if (!name || !user_id || !amount || !accountNumber || !routingNumber) {
            swal({
                type: 'error',
                title: 'Payment',
                text: "Complete withdrawal form",
            })
            return;
        }

        if (accountNumber.length != 12) {
            swal({
                type: 'error',
                title: 'Payment',
                text: "Invalid Account Number",
            })
            return;
        }
        if (routingNumber.length != 9) {
            swal({
                type: 'error',
                title: 'Payment',
                text: "Invalid Routing Number",
            })
            return;
        }
        var apiPayload = {
            user_id: user_id, name: name, amount: amount, accountNumber: accountNumber,
            routingNumber: routingNumber, payment_date: payment_date
        };
        axios.post(addMoneyAPI, apiPayload, { withCredentials: true })
            .then(res => {
                // eslint-disable-next-line
                if (res.data.errorMsg != '') {
                    swal({
                        type: 'error',
                        title: 'Withdaw Money',
                        text: res.data.errorMsg,
                    })
                } else {
                    swal({
                        type: 'Success',
                        title: 'Withdraw Money ',
                        text: res.data.successMsg,
                    })
                    setTimeout(function () {
                        window.location.href='http://localhost:3000/wallet'
                    }, 3000);                }
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
                    <legend>Withdraw Money</legend>
                    <div class="form-group">
                        <label class="col-sm-3 control-label" >Amount</label>
                        <div class="col-sm-9">
                            <input type="number" class="form-control" name="amount" placeholder="Enter Amount"
                                value={this.state.amount} onChange={this.handleUserInput} />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label" for="card-holder-name">Bank Name</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" name="bankName" id="card-holder-name" placeholder="Bank Name"
                                value={this.state.bankName} onChange={this.handleUserInput} />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-sm-3 control-label" for="card-number">Account Number</label>
                        <div class="col-sm-9">
                            <input type="number" class="form-control" name="accountNumber" id="card-number" placeholder="Account Number"
                                value={this.state.accountNumber} onChange={this.handleUserInput} />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Routing Number</label>
                        <div class="col-sm-3">
                            <input type="password" class="form-control" name="routingNumber" id="cvv" placeholder="Routing Number"
                                value={this.state.routingNumber} onChange={this.handleUserInput} />
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="col-sm-offset-3 col-sm-9">
                            <button type="button" class="btn btn-success" onClick={this.handleSubmit.bind(this)} >Withdraw Money</button>
                        </div>
                    </div>
                </fieldset>
            </form>
        )
    }
}


export default withRouter(BankDetail);