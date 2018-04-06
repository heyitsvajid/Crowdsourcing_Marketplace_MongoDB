import React, { Component } from 'react';
import Header from './Header'
import Footer from './Footer'
import Table from './Table'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import swal from 'sweetalert2'
import { envURL, reactURL } from '../config/environment';


class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title:'',
            action: '',
            tableHeaderData: ['Title', 'Employer', 'Avg Bid', 'My Bid', 'Status'],
            tableRowData: [],
            paginationData: [],
            freelancer: '',
            employer: '', openProjectsAction: '',
            progressProjectsAction: '',
            openProjectstableHeaderData: ['TITLE', 'BIDS', 'AVG BID', 'BUDGET','STATUS'],
            workInProgressProjectstableHeaderData:['TITLE', 'FREELANCER', 'AWARDED BID', 'DEADLINE','STATUS'],
            openProjectstableRowData: [],
            workInProgressProjectstableRowData:[ {title:''}]
        };
    }
    componentWillMount() {
        this.handleFreelancer();

    }
    onBackButtonEvent(e) {
        e.preventDefault();
        this.props.history.push('/home');
    }

    componentDidMount() {
        window.onpopstate = this.onBackButtonEvent.bind(this);
    }


    handlePageClick(e) {
        e.preventDefault();
        //        alert(e.target.id);
        var initialDisplay = this.state.paginationData[e.target.id]
        this.setState({
            tableRowData: initialDisplay
        });
    }


    handleFreelancer(e) {

        e ? e.preventDefault() : '';
        this.setState({
            title:'My Bids',
            freelancer: 'linkActive',
            employer: '',
            action: 'dashboard',
        })
        let url = envURL+'isLoggedIn';
        axios.get(url, { withCredentials: true })
            .then(res => {

                if (res.data.responseCode === 0) {
                    localStorage.setItem('id', res.data.id);
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('email', res.data.email);
                    let getUserBidProjects = envURL+'getUserBidProjects';
                    let id = localStorage.getItem('id');
                    if (id) {
                        var apiPayload = {
                            id: id
                        };
                        axios.post(getUserBidProjects, apiPayload)
                            .then(res => {
                                // eslint-disable-next-line
                                if (res.data.errorMsg != '') {
                                    this.setState({
                                        errorMessage: res.data.errorMsg
                                    });
                                    // eslint-disable-next-line
                                } else if (res.data.successMsg != '') {
                                    const [list, chuckSize] = [res.data.data, 10]

                                    this.setState({
                                        paginationData: new Array(Math.ceil(list.length / chuckSize)).fill().map(_ => list.splice(0, chuckSize))
                                    });
                                    var initialDisplay = this.state.paginationData[0]?this.state.paginationData[0]:[]
                                    this.setState({
                                        tableRowData: initialDisplay
                                    });
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
                    this.props.history.push('/login')
                    swal({
                        type: 'error',
                        title: 'Login',
                        text: 'Login Required',
                    })

                }
            })
            .catch(err => {
                console.error(err);
            });
    }
    handleEmployer(e) {
        e.preventDefault();
        this.setState({
            title:'My Projects',
            action:'',
            freelancer: '',
            employer: 'linkActive',
            openProjectsAction: 'myprojectsopen',
            progressProjectsAction: 'myprojectsprogress',
        })
        let url = envURL+'isLoggedIn';
        axios.get(url, { withCredentials: true })
            .then(res => {

                if (res.data.responseCode === 0) {
                    localStorage.setItem('id', res.data.id);
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('email', res.data.email);
                    let getUserProjects = envURL+'getUserProjects';
                    let id = localStorage.getItem('id');
                    if (id) {
                        var apiPayload = {
                            id: id
                        };
                        axios.post(getUserProjects, apiPayload)
                            .then(res => {
                                // eslint-disable-next-line
                                if (res.data.errorMsg != '') {
                                    this.setState({
                                        errorMessage: res.data.errorMsg
                                    });
                                    // eslint-disable-next-line
                                } else if (res.data.successMsg != '') {
                                    this.setState({
                                        openProjectstableRowData: res.data.data.openProjects,
                                        workInProgressProjectstableRowData: res.data.data.progressProjects,
                                    });
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
                    this.props.history.push('/login')
                    swal({
                        type: 'error',
                        title: 'Login',
                        text: 'Login Required',
                    })

                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    renderTable(){
        if(this.state.action!=''){
            return (<div class="content-wrapper mt-1">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="index.html">Dashboard</a>
                </li>
                <li class="breadcrumb-item active mr-5">{this.state.title}</li>

                <li class="rightAlign"><a class={this.state.employer} onClick={this.handleEmployer.bind(this)}
                    href=''> Employer</a> || <a href=''
                        onClick={this.handleFreelancer.bind(this)} class={this.state.freelancer}>Freelancer</a></li>
            </ol>
            <div class="row mt-1">
                <div class="col-15">
                    <p></p>
                    <div class="col-lg-11 container">
                        <div class="">
                            <div>
                            <Table action={this.state.action} tableHeaderData={this.state.tableHeaderData} averageBid={this.state.averageBid} tableRowData={this.state.tableRowData} />                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
                             </div>
            );
        }else{
            return (<div>       <div class="content-wrapper mt-1">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="index.html">My Projects</a>
                </li>
                <li class="breadcrumb-item active">Open</li>
                <li class="rightAlign"><a class={this.state.employer} onClick={this.handleEmployer.bind(this)}
                    href=''> Employer</a> || <a href=''
                        onClick={this.handleFreelancer.bind(this)} class={this.state.freelancer}>Freelancer</a></li>

            </ol>
            <div class="row mt-1">
                <div class="col-15">
                    <p></p>
                    <div class="col-lg-11 container">
                        <div class="">
                            <div>
                                <Table action={this.state.openProjectsAction} tableHeaderData={this.state.openProjectstableHeaderData} tableRowData={this.state.openProjectstableRowData} />

                            </div>
                        </div>
                    </div>
                </div>
            </div>

<br/>
                            </div>

                                       <div class="content-wrapper mt-1">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="index.html">My Projects</a>
                </li>
                <li class="breadcrumb-item active">Work in Progress</li>
            </ol>
            <div class="row mt-1">
                <div class="col-15">
                    <p></p>
                    <div class="col-lg-11 container">
                        <div class="">
                            <div>
                                <Table action={this.state.progressProjectsAction} tableHeaderData={this.state.workInProgressProjectstableHeaderData} tableRowData={this.state.workInProgressProjectstableRowData} />

                            </div>
                        </div>
                    </div>
                </div>
            </div>


                            </div>
</div>);
        }
    }
    render() {
        return (
            <div class='container'>
                <Header dashboard={'linkActive'} />
                
 {this.renderTable()}
                                     {<Footer />}</div>


        );
    }
}
export default withRouter(Dashboard);