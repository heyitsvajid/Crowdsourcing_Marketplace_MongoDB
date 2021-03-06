import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import axios from 'axios';
import swal from 'sweetalert2'
import { envURL, reactURL } from '../config/environment';

class Payment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canPayFromWallet: false,
            user: '',
            project: '',
            payment: false

        }
    }

    getBidAMount() {
        this.state.project.bids.forEach(element => {
            if (element.bid_status == 'BID ACCEPTED') {
                return element.bid_amount;
            }
        });

    }
    checkCanPay() {
        let bidAmount = 0;
        this.state.project.bids.forEach(element => {
            if (element.bid_status == 'BID ACCEPTED') {
                bidAmount = element.bid_amount;
                return;
            }
        });
        if (parseInt(this.state.user.account_balance) > parseInt(bidAmount)) {
            return true
        }
        return false;

    }

    componentWillMount() {
        let getUserDetailsAPI = envURL + 'getUserDetails';
        let project_id = localStorage.getItem('currentProjectId');
        let userId = localStorage.getItem('id');
        var apiPayload = { user_id: userId, project_id: project_id };
        axios.post(getUserDetailsAPI, apiPayload)
            .then(res => {
                if (res.data.errorMsg != '') {
                    this.setState({
                        errorMessage: res.data.errorMsg
                    });
                } else {
                    debugger;
                    if (res.data.data.project[0].project_status != 'Closed') {
                        console.log(res.data.data);
                        this.setState({
                            payment: true
                        })
                    }
                    this.setState({
                        user: res.data.data.user,
                        project: res.data.data.project[0],
                    });
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    handleUserInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    }
    handlePayment(e) {
        e.preventDefault();


        if (this.checkCanPay()) {
            let payFreelancerAPI = envURL + 'payFreelancer';
            let project_id = localStorage.getItem('currentProjectId');
            var apiPayload = { project_id: project_id };
            axios.post(payFreelancerAPI, apiPayload)
                .then(res => {
                    if (res.data.errorMsg != '') {
                        this.setState({
                            errorMessage: res.data.errorMsg
                        });
                    } else {
                        this.setState({
                            errorMessage: ''
                        });
                        swal({
                            type: 'success',
                            title: 'Payment Completed',
                            text: res.data.successMsg,
                        })
                        setTimeout(function () {
                            window.location.href = reactURL + 'dashboard'
                        }, 5000);
                    }
                })
                .catch(err => {
                    console.error(err);
                });

        }
        else {
            swal({
                type: 'error',
                title: 'Pay Freelancer',
                text: 'Not Sufficient balance in wallet.',
            })
        }

    }
    renderRows() {
        if (this.state.errorMessage != '') {
            return (
                <p class="text-danger" >{this.state.errorMessage}</p>
            );
        }
    }
    renderPayment() {
        if (this.state.payment) {
            return (<button className="btn btn-lg btn-success" type="submit"
                onClick={this.handlePayment.bind(this)} >Pay from Wallet</button>
            );
        } else {
            return (<h1 className='h3 mb-3 font-weight-normal text-success'>Payment Complete </h1>)
        }
    }
    render() {
        return (
            <div className="text-center divclasscenter"  >
                <form className="form-signup" method="POST">
                    <h1 className="">Payment</h1>
                    <div className="panel panel-default">
                        {this.renderRows()}
                    </div>

                    {this.renderPayment()}
                    <div className="modal-footer">
                    </div>
                </form>
            </div>
        );
    }
}
export default withRouter(Payment);