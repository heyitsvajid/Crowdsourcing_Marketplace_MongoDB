import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import Header from './Header'
import Submission from './Submission'
import Payment from './Payment'
import BidProjectForm from './BidProjectForm'
import ProjectBidDetail from './ProjectBidDetail'
import Footer from './Footer'
import axios from 'axios';
import { bindActionCreators } from 'redux'
import { currentProject } from '../Actions/index'
import { connect } from 'react-redux'
import { envURL, reactURL } from '../config/environment';

class ProjectItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            period: '',
            skill: '',
            average: '',
            description: '',
            budget: '',
            attachment: '',
            bidNowButton: true,
            bidNowForrm: false,
            employer: false,
            bidNowFlag: false,
            hireFlag: false,
            submissionFlag: false,
            paymentFlag: false,
            documentHref: '',
            submission:[]
        };
    }

    componentWillMount() {
        let getProjectAPI = envURL+'getProject';
        let id = localStorage.getItem('currentProjectId');
        let currentUserId = localStorage.getItem('id');
        if (id) {
            var apiPayload = {
                id: id,
                currentUserId: currentUserId
            };
            axios.post(getProjectAPI, apiPayload)
                .then(res => {
                    console.log(res.data);
                    // eslint-disable-next-line
                    if (res.data.errorMsg != '') {
                        this.setState({
                            errorMessage: res.data.errorMsg
                        });
                        // eslint-disable-next-line
                    } else if (res.data.successMsg != '') {
                        debugger;
                        this.setState({
                            title: res.data.data.title,
                            skill: res.data.data.skill,
                            description: res.data.data.description,
                            budget_range: res.data.data.budget_range.join('-'),
                            period: res.data.data.period,
                            average: res.data.data.average,
                            documentHref: res.data.data.project_document,
                            submission: res.data.data.submission_document
                        });
                        if (res.data.data.freelancer_id == 0) {
                            if (res.data.data.employer_id == currentUserId) {
                                this.setState({
                                    hireFlag: true
                                })
                            } else {
                                this.setState({
                                    bidNowFlag: true
                                })
                            }
                        } else {
                            if (res.data.data.freelancer_id == currentUserId) {
                                this.setState({
                                    submissionFlag: true
                                })
                            }
                            if (res.data.data.employer_id == currentUserId) {
                                this.setState({
                                    paymentFlag: true
                                })
                            }
                        }
                        if (res.data.data.freelancer_id != 0 && res.data.data.project_status != 'Closed') {
                            this.setState({
                                employer: true
                            })
                        }
                        this.props.currentProject(res.data.data);
                    } else {
                        this.setState({
                            errorMessage: 'Unknown error occurred'
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                });
            let checkBidAPI = envURL+'checkBid';
            let projectId = localStorage.getItem('currentProjectId');
            let userId = localStorage.getItem('id');
            var apiPayload2 = { userId: userId, projectId: projectId };
            axios.post(checkBidAPI, apiPayload2)
                .then(res => {
                    if (res.data.errorMsg != '') {
                        this.setState({
                            errorMessage: res.data.errorMsg
                        });
                    } else {
                        if (res.data.data.update == true) {
                            this.setState({
                                bidNowButton: false
                            });

                        } else {
                            this.setState({
                                bidNowButton: true
                            });
                        }

                    }
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }
    calculateAverageBid(bids) {
        let sum = 0;
        bids.forEach(bid => {
            sum = sum + bid.bid_amount;
        });
        let average = sum / bids.length;

        return isNaN(average) ? 0 : average;
    }
    handlebidNowButton() {
        this.setState({
            bidNowForm: !this.state.bidNowForm
        });
    }

    submissionForm() {
        if (this.state.submissionFlag) {
            return (
                <Submission />
            );
        }
    }
    paymentForm() {

        if (this.state.paymentFlag) {
            console.log(this.props.project.submission_document);
            let submission_detail='';
            let sub_header = '';
            if(this.props.project.submission_document){
                sub_header = <h3>Freelancer Uploads</h3>;
                submission_detail = this.props.project.submission_document.map(file_data => {
                return (
                    <div>
                    <li><label>{file_data.split(',')[0]} : </label>
                    <span class="pull-right"><a href={file_data.split(',')[1]} download>Download Attachment</a>
                    </span>
                    </li>
                    </div> 
                )
              });}
            return (
                <div className="panel panel-default">
                <Payment />
                <br/><br/>
                    
                {sub_header}
                <ul className="list-unstyled">
                {submission_detail}
                </ul>
                </div>
            );
        }
    }

    bidNowForm() {
        if (this.state.bidNowForm && this.props.project.project_status == 'OPEN') {
            return (
                <BidProjectForm />
            );
        }
    }
    bidNow() {
        // eslint-disable-next-line
        if (this.state.bidNowFlag) {
                if (this.state.bidNowButton) {
                    return (
                        <button className="btn btn-lg btn-success btn-sm" type="submit"
                            onClick={this.handlebidNowButton.bind(this)} >Bid Now</button>
                    );
                } else {
                    return (<button className="btn btn-lg btn-success btn-sm" type='submit'
                        onClick={this.handlebidNowButton.bind(this)}>Update Bid</button>);
                }
        }
    }

    renderFile() {
        if (this.state.documentHref != '') {
            var link1 = require("../files/" + this.state.documentHref);
            return <a href={link1} download>Download Attachment</a>
        }
    }
    render() {
        return (

            <div class="container">
                <Header />
                <div>
                    <div class="content-wrapper">
                        <ol class="breadcrumb mt-2">
                            <li class="breadcrumb-item">
                                <a href="">Project</a>
                            </li>
                            <li class="breadcrumb-item active">Project Details</li>
                        </ol>
                    </div>
                    <div class='row'>

                        <div class='col md-6'>
                            <div class="row mt-3 ml-5">
                                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 " >
                                    <div class="panel panel-info">
                                        <div class="row panel-heading">
                                            <h3 class="panel-title">{this.props.project.title}</h3>
                                        </div>
                                        <div>
                                            <div>
                                                {this.bidNow()}                                                <div class="mt-4 ml-5">
                                                    <table class="table">
                                                        <tbody>
                                                            <tr>
                                                                <td><strong>Skills </strong></td>
                                                                <td>{this.props.project.technology_stack}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Budget</strong></td>
                                                                <td><strong>$</strong> {this.state.budget_range}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Period</strong></td>
                                                                <td>{this.props.project.budget_period} Day/s</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Average Bid</strong></td>
                                                                <td><strong>$</strong> {this.calculateAverageBid(this.props.project.bids ? this.props.project.bids : [])}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Details</strong></td>
                                                                <td>{this.renderFile()}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Description</strong></td>
                                                                <td><textarea rows="5" cols='50' disabled value={this.props.project.description} ></textarea></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div class='col md-6 mt-5' hide='true'>
                            {this.bidNowForm()}
                            {this.submissionForm()}
                            {this.paymentForm()}
                        </div>

                    </div>
                    <hr />
                    <div>  <div class="content-wrapper">
                        <ol class="breadcrumb mt-2">
                            <li class="breadcrumb-item">
                                <a href="">Project</a>
                            </li>
                            <li class="breadcrumb-item active">Project Bids</li>
                        </ol>
                    </div>
                        <ProjectBidDetail />
                    </div>


                </div>
                <div class='mt-5' >
                    {<Footer />}
                </div></div>
        );
    }
}
function mapStateToProps(state) {
    return {
        project: state.currentProject
    }
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({ currentProject: currentProject }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(withRouter(ProjectItem));