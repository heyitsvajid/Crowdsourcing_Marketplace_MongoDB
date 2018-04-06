import React, { Component } from 'react';
import swal from 'sweetalert2'
import axios from 'axios';
import { withRouter } from 'react-router-dom'
import { envURL, reactURL } from '../config/environment';

class CustomRow extends Component {

    handleProjectClick = (e) => {
        e.preventDefault();
        localStorage.setItem('currentProjectId', e.target.id);
        if (this.props.action === 'myprojectsopen') {
            localStorage.setItem('hireFlag', true);
        } else {
            localStorage.setItem('hireFlag', false);
        }
        window.location.href = reactURL+'projectitem'
    }
    handleProfileClick = (e) => {
        let getprofileAPI = envURL+'getprofile';
        e.preventDefault();
        let id = e.target.id;
        var apiPayload = {
            id: id
        };
        axios.post(getprofileAPI, apiPayload)
            .then(res => {
                // eslint-disable-next-line
                if (res.data.errorMsg != '') {
                    this.setState({
                        errorMessage: res.data.errorMsg
                    });
                    // eslint-disable-next-line
                } else if (res.data.successMsg != '') {
                    swal({
                        imageUrl: res.data.data.profile ? require('../images/' + id + '.png') : '',
                        imageHeight: 200,
                        showCloseButton: true,
                        title: res.data.data.name,
                        text: res.data.data.about,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: res.data.data.email,
                        footer: res.data.data.phone ? 'Contact : ' + res.data.data.phone : '',
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
    calculateAverageBid(bids) {
        let sum = 0;
        bids.forEach(bid => {
            sum = sum + bid.bid_amount;
        });
        let average = sum / bids.length;

        return isNaN(average) ? 0 : average;
    }
    getAcceptedBidAmount(bids) {
        bids.forEach(bid => {
            if (bid.status === 'BID ACCEPTED') {
                return bid.bid_amount;
            }
        });
    }
    renderRows() {
        if (this.props.action === 'dashboard') {
            return (
                <tr align='center'>
                    <td><a href='' id={this.props.rowData.project_id} onClick={this.handleProjectClick} >{this.props.rowData.title}</a></td>
                    <td><a href='' id={this.props.rowData.employer_id} onClick={this.handleProfileClick} >{this.props.rowData.employer_name}</a></td>
                    <td>$ {this.props.rowData.average}</td>
                    <td>$ {this.props.rowData.bid_amount}</td>
                    <td>{this.props.rowData.bid_status}</td>
                </tr>
            );
        } else if (this.props.action === 'open') {
            return (
                <tr align='center'>
                    <td><a href='' id={this.props.rowData._id} onClick={this.handleProjectClick} >{this.props.rowData.title}</a></td>
                    <td><a href='' id={this.props.rowData.employer_id} onClick={this.handleProfileClick} >{this.props.rowData.employer_name}</a></td>
                    <td>{this.props.rowData.technology_stack}</td>
                    <td>$ {this.calculateAverageBid(this.props.rowData.bids)}</td>
                    <td>$ {this.props.rowData.budget_range[0]}-{this.props.rowData.budget_range[1]}</td>
                    <td>{this.props.rowData.budget_period} Days</td>
                    <td>{this.props.rowData.bids.length}</td>
                    {/* <td><button className="buttonAction" type="button"
                        id={this.props.rowData._id} onClick={this.handleProjectClick} >Bid Now</button></td> */}
                </tr>
            );
        } else if (this.props.action === 'search') {
            return (
                <tr align='center'>
                    <td><a href='' id={this.props.rowData._id} onClick={this.handleProjectClick} >{this.props.rowData.title}</a></td>
                    <td><a href='' id={this.props.rowData.employer_id} onClick={this.handleProfileClick} >{this.props.rowData.employer_name}</a></td>
                    <td>{this.props.rowData.technology_stack}</td>
                    <td>$ {this.calculateAverageBid(this.props.rowData.bids)}</td>
                    <td>$ {this.props.rowData.budget_range[0]}-{this.props.rowData.budget_range[1]}</td>
                    <td>{this.props.rowData.budget_period} Days</td>
                    <td>{this.props.rowData.bids.length}</td>
                    <td>{this.props.rowData.project_status}</td>
                </tr>
            );
        }
        else if (this.props.action === 'myprojectsopen') {
            return (
                <tr align='center'>
                    <td><a href='' id={this.props.rowData._id} onClick={this.handleProjectClick} >{this.props.rowData.title}</a></td>
                    <td>{this.props.rowData.bids.length}</td>
                    <td>$ {this.calculateAverageBid(this.props.rowData.bids)}</td>
                    <td>$ {this.props.rowData.budget_range[0]}-{this.props.rowData.budget_range[1]}</td>
                    <td>{this.props.rowData.project_status}</td>
                </tr>
            );
        } else {
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
            return (
                <tr align='center'>
                    <td><a href='' id={this.props.rowData._id} onClick={this.handleProjectClick} >{this.props.rowData.title}</a></td>
                    <td><a href='' id={this.props.rowData.freelancer_id} onClick={this.handleProfileClick} >{this.props.rowData.freelancer_name}</a></td>
                    <td>$ 1000</td>
                    <td>{this.props.rowData.date_end}</td>
                    <td>Work In Progress</td>
                </tr>
            )
        }
    }


    render() {

        return (

            <tbody>
                {this.renderRows()}
            </tbody>
        );
    }
}
export default withRouter(CustomRow);