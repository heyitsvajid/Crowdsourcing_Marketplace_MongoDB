import React, { Component } from 'react';
import Header from './Header'
import CardDetails from './CardDetails'
import BankDetail from './BankDetail'
import Footer from './Footer'
import Table from './Table'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import swal from 'sweetalert2'
import PieChart from 'react-simple-pie-chart';

class Wallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            creditTransaction: [],
            debitTransaction: [],
            cardDetailForm:false,
            bankDetailForm:false
        };
    }

    componentWillMount() {
        let url = 'http://localhost:3001/isLoggedIn';
        axios.get(url, { withCredentials: true })
            .then(res => {

                if (res.data.responseCode === 0) {
                    localStorage.setItem('id', res.data.id);
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('email', res.data.email);
                    let getUserWalletDetails = 'http://localhost:3001/getUserWalletDetails';
                    let id = localStorage.getItem('id');
                    if (id) {
                        var apiPayload = {
                            id: id
                        };
                        axios.post(getUserWalletDetails, apiPayload)
                            .then(res => {
                                // eslint-disable-next-line
                                if (res.data.errorMsg != '') {
                                    this.setState({
                                        errorMessage: res.data.errorMsg
                                    });
                                    // eslint-disable-next-line
                                } else if (res.data.successMsg != '') {
                                    console.log(res.data.data)
                                    this.setState({
                                        user: res.data.data.user,
                                        creditTransaction: res.data.data.creditTransaction,
                                        debitTransaction: res.data.data.debitTransaction,
                                    })
                                                              
                                } else {
                                    this.setState({
                                        errorMessage: 'Unknown error occurred'
                                    });
                                }
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    }
                }
                else {
                    swal({
                        type: 'error',
                        title: 'Login',
                        text: 'Login Required',
                    })
                    this.props.history.push('/login')
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    getTotalCreditAmount(){
        let sum=0;
        this.state.creditTransaction.forEach(transaction => {
            sum = parseInt(sum)+parseInt(transaction.amount)
        });
        return sum;
    }
    getTotalDebitAmount(){
        let sum=0;
        this.state.debitTransaction.forEach(transaction => {
            sum = parseInt(sum)+parseInt(transaction.amount)
        });
        return sum;
        
    }
    addMoney(e){
        e.preventDefault();
        this.setState({
            cardDetailForm: !this.state.cardDetailForm
        });
    }
    withdrawMoney(e){
        e.preventDefault();
        this.setState({
            bankDetailForm: !this.state.bankDetailForm
        });
    }
    cardDetailForm(){
        if (this.state.cardDetailForm) {
            return (
                <CardDetails/>
            );
        }
    }
    bankDetailForm(){
        if (this.state.bankDetailForm) {
            return (
                <BankDetail/>
            );
        }
    }
    
    render() {

        let creditNodes = this.state.creditTransaction.map(rowData => {
            return (
                <tr>
                <td>{rowData.payment_date}</td>
                <td>{rowData.employer_name?rowData.employer_name:'-'}</td>
                <td>{rowData.project_name?rowData.project_name:'-'}</td>
                <td>{rowData.amount}</td>
                <td>{rowData.description}</td>
            </tr>
            )
          });

          let debitNodes = this.state.debitTransaction.map(rowData => {
            return (
                <tr>
                <td>{rowData.payment_date}</td>
                <td>{rowData.project_name}</td>
                <td>{rowData.freelancer_name}</td>
                <td>{rowData.amount}</td>
                <td>{rowData.description}</td>
            </tr>
      
            )
          });

        return (
            <div>
            <div class='container'>
                <Header home={'linkActive'} />
                <div class="content-wrapper mt-1">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="index.html">Wallet</a>
                        </li>
                        <li class="breadcrumb-item active">Transaction Details</li>
                    </ol>
                    <div class="row mt-1">
                        <div class="col-15">
                            <p></p>
                            <div class="col-lg-11 container">
                            <div class="container">

<div  class="col-md-8">
    <h4>Account Details</h4>
    <div>
          <div class="card flex-md-row mb-5 box-shadow h-md-300">
            <div class="card-body d-flex flex-column align-items-start ">
              <div class="mb-1"><strong><p class="card-text mb-auto text-muted">Wallet Balance as of {(new Date()).toDateString()}</p></strong></div>
              <strong><h6> $ {this.state.user.account_balance}</h6></strong>  
              <br/>
                <button type="button" id='add' onClick={this.addMoney.bind(this)} class="btn btn-primary">Add Money</button>

                <br/>
                <button type="button" id='add' onClick={this.withdrawMoney.bind(this)} class="btn btn-primary">Withdraw Money</button>
               
                 <div />
            </div>
          
          </div><br /></div>
    </div>

{this.cardDetailForm()}
{this.bankDetailForm()}
    <div class="row">


            <div class="col-md-3">
              
              <div class="text-center">
              <div class="panel-heading">
                    <h5>Credit Debit Chart</h5>
                
              
              <PieChart
  slices={[
    {
      color: 'green',
      value: this.getTotalCreditAmount(),
    },
    {
      color: 'red',
      value: this.getTotalDebitAmount(),
      key: "active users"

    },
  ]}
/>       
<h6>Total Credit : {this.getTotalCreditAmount()}</h6>
<h6>Total Debit : {this.getTotalDebitAmount()}</h6>
</div></div>
            </div>
            <div class="col-xs-10 personal-info">
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <h5>Transactions History</h5>
                </div>
                <br/>
                    <ul class="list-group">
                    
                    <li class="list-group-item">
                    <p class="bg-success text-center"><strong>Credit Transactions</strong></p>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Transaction date</th>
                                <th>From Employer</th>
                                <th>For Project</th>
                                <th>Amount</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                        {creditNodes}
                        </tbody>
                    </table>
                    
                    </li>
               <br/><br/>
                    <li class="list-group-item">
                    <p class="bg-danger text-center"><strong>Debit Transactions</strong></p>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Transaction date</th>
                                <th>For Project</th>
                                <th>To Freelancer</th>
                                <th>Amount</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
{debitNodes}                        </tbody>
                    </table>
                    </li>
                    
                    
                </ul>
            </div>
            </div>


        
    </div>
</div>

                            </div>
                        </div>
                    </div>


                </div>
                </div>
                
                
                
                {<Footer />} </div>
        );
    }
}
export default withRouter(Wallet);