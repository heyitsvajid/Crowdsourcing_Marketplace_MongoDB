import React, { Component } from 'react';
import Header from './Header'
import Footer from './Footer'
import Table from './Table'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import swal from 'sweetalert2'
import { envURL, reactURL } from '../config/environment';

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            action: 'search',
            tableHeaderData: ['Title', 'Employer', 'Skill', 'Avg Bid', 'Budget Range', 'Budget Period', 'No. of Bids', 'Status'],
            tableRowData: [],
            paginationData: [],
            status:''
        };
    }

    handleUserInput = (e) => {
        const value = e.target.value;
        this.setState({
            status:value
        });
        this.getSearchProjects();
    }
    componentWillMount() {
        this.getSearchProjects();
    }

    getSearchProjects(){
        let url = envURL+'isLoggedIn';
        axios.get(url, { withCredentials: true })
            .then(res => {
                if (res.data.responseCode === 0) {
                    localStorage.setItem('id', res.data.id);
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('email', res.data.email);
                    let getSearchProjects = envURL+'searchProject';
                    let id = localStorage.getItem('id');
                    let parameter = window.location.href;
                    let search_string = parameter.split('=')[1]
                    let status_filter = this.state.status;
                    if (id) {
                        var apiPayload = {
                            id: id,
                            search_string: search_string,
                            status_filter:status_filter
                        };
                        axios.post(getSearchProjects, apiPayload)
                            .then(res => {
                                // eslint-disable-next-line
                                if (res.data.errorMsg != '') {
                                    this.setState({
                                        errorMessage: res.data.errorMsg
                                    });
                                    // eslint-disable-next-line
                                } else if (res.data.successMsg != '') {
                                    console.log(res.data.data)
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
                <Header />


                <div class="content-wrapper mt-1">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="index.html">Open Projects</a>
                        </li>
                        <li class="breadcrumb-item active">Search Results</li>
                    </ol>
                    <div class="row mt-1">
                        <div class="col-15">
                            <p></p>
                            <div class="col-lg-11 container">
                                <div class="">
                                    <div>

                                        <select class="float-right form-control col-sm-2 mb-3" name="expYear"
                                            value={this.state.status} onChange={this.handleUserInput} >
                                            <option value="OPEN">Open</option>
                                            <option value="Closed">Closed</option>
                                            <option value="">ALL</option>
                                        </select>
                                        <h4><strong class='float-right text-info mr-4'>Filter</strong></h4>
                                        
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
export default withRouter(Search);