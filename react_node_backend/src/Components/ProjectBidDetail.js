import React, { Component } from 'react';
import axios from 'axios'
import swal from 'sweetalert2'
import { withRouter } from 'react-router-dom'
import { envURL, reactURL } from '../config/environment';

class ProjectBidDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectBids: [],
      ascending:false
    }
  }
  componentWillMount() {
    let getBidsAPI = envURL+'getBids';
    let id = localStorage.getItem('currentProjectId');
    let currentUserId = localStorage.getItem('id');
    if (id) {
      var apiPayload = {
        id: id,
        currentUserId: currentUserId
      };
      axios.post(getBidsAPI, apiPayload)
        .then(res => {
          if (res.data.errorMsg != '') {
            this.setState({
              errorMessage: res.data.errorMsg
            });
          } else if (res.data.successMsg != '') {
            this.setState({
              projectBids: res.data.data
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

checkImage(imageSrc, good, bad) {
    var img = new Image();
    img.onload = good; 
    img.onerror = bad;
    img.src = imageSrc;
}

  renderImage(id, profile_id) {

    if (!profile_id) {
      return <img class="card-img-right flex-auto d-none d-md-block" alt="Thumbnail [200x250]"
        width='200px' height='200px'
        src={require('../images/freelancer_32_32.png')} data-holder-rendered="true" />;
    } else {
      var imageSource = require('../images/' + id + '.png')? require('../images/' + id + '.png'):require('../images/freelancer_32_32.png');
      return <img class="card-img-right flex-auto d-none d-md-block" alt="Thumbnail [200x250]"
        width='200px' height='200px'
        src={imageSource} data-holder-rendered="true" />;
    }

  }

  hireEmployer = (e) => {
    let hireEmployerAPI = envURL+'hireEmployer';
    let projectId = localStorage.getItem('currentProjectId');
    var str = e.target.id;
    var res = str.split("/");
    let freelancerId = res[0];
    let freelancer_name =res[2]
    var endDate = new Date(new Date().getTime() + (res[1] * 24 * 60 * 60 * 1000));
    if (!projectId || !freelancerId) {
      console.log('Project/Employee ID not found');
      return;
    }
    var apiPayload = { freelancer_name:freelancer_name,freelancerId: freelancerId, projectId: projectId, endDate: endDate.toDateString() };
    axios.post(hireEmployerAPI, apiPayload)
      .then(res => {
        if (res.data.errorMsg != '') {
          this.setState({
            errorMessage: res.data.errorMsg
          });
        } else {
          this.setState({
            errorMessage: ''
          });
          this.props.history.push('/dashboard');
          swal({
            type: 'success',
            title: 'Hire',
            text: 'Employee Hired',
          })
          setTimeout(function () {
            window.location.href=+reactURL+'myprojects'
        }, 5000);        
        }
      })
      .catch(err => {
        console.error(err);
      });
  }
sortBids(){
  let bids = this.state.projectBids;
  if(this.state.ascending){
    bids.sort(function(a, b){
      return a.bid_amount == b.bid_amount ? 0 : +(a.bid_amount > b.bid_amount) || -1;
    });  
  }else{
    bids.sort(function(a, b){
      return a.bid_amount == b.bid_amount ? 0 : +(a.bid_amount < b.bid_amount) || -1;
    });
  }
  this.setState({
    ascending : !this.state.ascending,
    projectBids : bids
  })
}

renderSortBidButton(){
//  if(localStorage.getItem('bidNowFlag')=='false'){
    return (<button type="button" onClick={this.sortBids.bind(this)} class="btn btn-info">Sort {this.state.ascending?'Ascending':'Descending'}</button>);
 // }
}


  render() {

    let projectBids = this.state.projectBids.map(bid => {
      return (
        <div>
          <div class="card flex-md-row mb-8 box-shadow h-md-300">
            <div class="card-body d-flex flex-column align-items-start ">
              <h3> <strong class="d-inline-block mb-1 text-primary">{bid.freelancer_name}</strong></h3>

              <div class="mb-1"><strong><p class="card-text mb-auto text-muted">Days : {bid.bid_period}</p></strong></div>
              <strong><p class="card-text mb-auto text-muted">Bid : $ {bid.bid_amount}</p></strong>
              <strong><p class="card-text mb-auto text-muted">Bid Date : {(bid.bid_date).substr(0,10)}</p></strong>
              <strong><p class="card-text mb-auto text-muted">Bid Status : {bid.bid_status}</p></strong>
              {localStorage.getItem('hireFlag') == 'true' ?
                <button type="button" id={bid.freelancer_id + '/' + bid.bid_period+'/'+bid.freelancer_name} onClick={this.hireEmployer} class="btn btn-primary">Hire {bid.name}</button>
                : <div />}
            </div>
            {this.renderImage(bid.freelancer_id)}

          </div><br /></div>)
    })
    return (
      <div class="col-md-8 mt-5">
      {this.renderSortBidButton()}
        {projectBids}
      </div>

    );
  }
}
export default withRouter(ProjectBidDetail);