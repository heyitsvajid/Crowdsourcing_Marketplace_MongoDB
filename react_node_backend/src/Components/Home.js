import React, { Component } from 'react';
import Header from './Header'
import Footer from './Footer'
import Table from './Table'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import swal from 'sweetalert2'
import { envURL, reactURL } from '../config/environment';


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            action: 'open',
            tableHeaderData: ['TITLE', 'EMPLOYER', 'SKILL', 'AVG BID', 'BUDGET RANGE', 'BUDGET PERIOD', 'BID COUNT'],
            tableRowData: [],
            paginationData: [],
            allProjects: [],
            releventProjects: [],
            style:true
        };
    }

    handleAllClick(e) {
        this.setState({
            style:true
        })
        e?e.preventDefault():'';
        let url = envURL + 'isLoggedIn';
        axios.get(url, { withCredentials: true })
            .then(res => {

                if (res.data.responseCode === 0) {
                    localStorage.setItem('id', res.data.id);
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('email', res.data.email);
                    let getOpenProjects = envURL + 'getOpenProjects';
                    let id = localStorage.getItem('id');
                    if (id) {
                        var apiPayload = {
                            id: id
                        };
                        axios.post(getOpenProjects, apiPayload, { withCredentials: true })
                            .then(res => {
                                // eslint-disable-next-line
                                if (res.data.errorMsg != '') {
                                    this.setState({
                                        errorMessage: res.data.errorMsg
                                    });
                                    // eslint-disable-next-line
                                } else if (res.data.successMsg != '') {
                                    console.log(res.data.data.allProjects)
                                    const [list, chuckSize] = [res.data.data.allProjects, 10]

                                    this.setState({
                                        paginationData: new Array(Math.ceil(list.length / chuckSize)).fill().map(_ => list.splice(0, chuckSize))
                                    });
                                    var initialDisplay = this.state.paginationData[0] ? this.state.paginationData[0] : []
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
    handleRelevantClick(e) {
        this.setState({
            style:false
        })
        e?e.preventDefault():'';
        let url = envURL + 'isLoggedIn';
        axios.get(url, { withCredentials: true })
            .then(res => {

                if (res.data.responseCode === 0) {
                    localStorage.setItem('id', res.data.id);
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('email', res.data.email);
                    let getOpenProjects = envURL + 'getOpenProjects';
                    let id = localStorage.getItem('id');
                    if (id) {
                        var apiPayload = {
                            id: id
                        };
                        axios.post(getOpenProjects, apiPayload, { withCredentials: true })
                            .then(res => {
                                // eslint-disable-next-line
                                if (res.data.errorMsg != '') {
                                    this.setState({
                                        errorMessage: res.data.errorMsg
                                    });
                                    // eslint-disable-next-line
                                } else if (res.data.successMsg != '') {
                                    console.log(res.data.data.releventProjects)
                                    const [list, chuckSize] = [res.data.data.releventProjects, 10]

                                    this.setState({
                                        paginationData: new Array(Math.ceil(list.length / chuckSize)).fill().map(_ => list.splice(0, chuckSize))
                                    });
                                    var initialDisplay = this.state.paginationData[0] ? this.state.paginationData[0] : []
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



    componentWillMount() {
        this.handleAllClick();
    }

    handlePageClick(e) {
        e.preventDefault();
        //        alert(e.target.id);
        var initialDisplay = this.state.paginationData[e.target.id]
        this.setState({
            tableRowData: initialDisplay
        });
    }
    onBackButtonEvent(e) {
        e.preventDefault();
        this.props.history.push('/home');
    }
    componentDidMount() {
        window.onpopstate = this.onBackButtonEvent.bind(this);

    }
    render() {
        let paginationLinks = this.state.paginationData.map((page, index) => {
            return (
                <a href='' onClick={this.handlePageClick.bind(this)} id={index}>{index + 1}</a>
            )
        });

        return (
            <div class='container'>
                <Header home={'linkActive'} />
                <div class="content-wrapper mt-1">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="index.html">Home</a>
                        </li>
                        <li class="breadcrumb-item active">Open Projects</li>
                        <li class="rightAlign"><a class={this.state.style?'linkActive':''}  onClick={this.handleAllClick.bind(this)} href=''> All</a> ||
                          <a href='' class={this.state.style?'':'linkActive'} onClick={this.handleRelevantClick.bind(this)} >Relevant Projects</a></li>

                    </ol>
                    <div class="row mt-1">
                        <div class="col-15">
                            <p></p>
                            <div class="col-lg-11 container">
                                <div class="">
                                    <div>
                                        <Table action={this.state.action} tableHeaderData={this.state.tableHeaderData} tableRowData={this.state.tableRowData} />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pagination">
                        <a href="#">&laquo;</a>
                        {paginationLinks}
                        <a href="#">&raquo;</a>

                    </div>

                    {<Footer />}                 </div>
            </div>
        );
    }
}
export default withRouter(Home);