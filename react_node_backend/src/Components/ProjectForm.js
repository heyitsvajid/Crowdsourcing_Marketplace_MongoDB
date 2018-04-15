import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { post } from 'axios';
import { Link } from 'react-router-dom';
import swal from 'sweetalert2'
import { envURL, reactURL } from '../config/environment';

class ProjectForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      successMessage: '',
      errorMessage: '',
      title: '',
      description: '',
      skill: '',
      min: '',
      max:'',
      period: '',
    }
    this._handleChangeFile = this._handleChangeFile.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleUserInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value })

  }
  handleSubmit(e) {
    e.preventDefault();
    let postProjectAPI = envURL+'postProject';
    let title = this.state.title.trim();
    let description = this.state.description;
    let skill = this.state.skill;
    let min = this.state.min;
    let max = this.state.max;
    let period = this.state.period;
    let employer_id = localStorage.getItem('id');
    let employer_name = localStorage.getItem('name');

    if (!title || !description || !min || !skill || !period) {
      swal({
        type: 'error',
        title: 'Post Project',
        text: 'Please complete the form',
      })
      return;
    }

    const formData = new FormData();
    formData.append('file', this.state.file);
    formData.append('employer_id', employer_id);
    formData.append('employer_name', employer_name);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('skills', skill);
    formData.append('min', min);
    formData.append('max', max);
    formData.append('period', period);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    post(postProjectAPI, formData, config).then(function (res) {
      // eslint-disable-next-line
      if (res.data.errorMsg != '') {
        swal({
          type: 'error',
          title: 'Post Project',
          text: 'Error Posting Project',
          // eslint-disable-next-line
        })} else if (res.data.successMsg != '') {
          swal({
            type: 'success',
            title: 'Post Project',
            text: 'Project posted successfully',
          })
           window.location.href = reactURL+'home'
           this.setState({
             file: '',
             successMessage: '',
             errorMessage: '',
             title: '',
             description: '',
             skill: '',
             min: '',
             max:'',
             period: '',
           });
      }
    });
  }
  _handleChangeFile(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    // eslint-disable-next-line
    if (file.type == 'application/pdf') {
      reader.onloadend = () => {
        this.setState({
          file: file,
        });
      }
      reader.readAsDataURL(file)
    }
    else {
      swal({
        type: 'error',
        title: 'File Upload',
        text: 'Only PDF attachments allowed',
      })
    }
  }
  render() {
    return (
      <div className="container">
        <div class="row">
          <div class="col-md-9 personal-info">
            <h3>Project Info</h3>
            <hr />

            <form class="form-horizontal">
              <div class="form-group">
                <label class="col-lg-3 control-label"><strong>Title</strong></label>
                <div class="col-lg-8">
                  <input class="form-control" type="text" name="title"
                    placeholder="Title" required="" value={this.state.title} onChange={this.handleUserInput} />
                </div>
              </div>
              <div class="form-group">
                <label class="col-md-3 control-label"><strong>Description</strong></label>
                <div class="col-md-8">
                  <textarea class="form-control" rows="5" name="description"
                    placeholder="Description" required="" value={this.state.description} onChange={this.handleUserInput}></textarea>
                </div>
              </div>
              <div class="form-group">
                <label class="col-lg-3 control-label"><strong>Skills</strong></label>
                <div class="col-lg-8">
                  <input class="form-control" type="text" name="skill"
                    placeholder="Comma separated Skills" required="" value={this.state.skill} onChange={this.handleUserInput} />
                </div>
              </div>
              <div class="form-group">
                <label class="col-lg-3 control-label"><strong>Minimum Budget</strong></label>
                <div class="col-lg-8">
                  <input class="form-control" type="number" name="min"
                    placeholder="Minimum Budget" required="" value={this.state.min} onChange={this.handleUserInput} />
                </div>
              </div>
              <div class="form-group">
                <label class="col-lg-3 control-label"><strong>Maximum Budget</strong></label>
                <div class="col-lg-8">
                  <input class="form-control" type="number" name="max"
                    placeholder="Maximum Budget" required="" value={this.state.max} onChange={this.handleUserInput} />
                </div>
              </div>
              <div class="form-group">
                <label class="col-lg-3 control-label"><strong>Budget Period</strong></label>
                <div class="col-lg-8">
                  <input class="form-control" type="number" name="period"
                    placeholder="Period in Days" required="" value={this.state.period} onChange={this.handleUserInput} />
                </div>
              </div>
              <div class="form-group">
                <label class="col-lg-3 control-label"><strong>Attachment</strong></label>
                <div class="col-lg-8">
                  <input type="file" class="form-control" onChange={this._handleChangeFile} />            </div>
              </div>
              <div class="form-group">
                <label class="col-md-3 control-label"></label>
                <div class="col-md-8">
                  <input type="submit" class="btn btn-primary"
                    value="Post Project" required="" onClick={this.handleSubmit.bind(this)} />
                  <span></span>
                  <Link to='/home'> <input type="reset" class="btn btn-default" value="Cancel" /></Link>
                </div>
              </div>
            </form>
          </div>
        </div>


        <hr />
      
      </div>
    );
  }
}

export default withRouter(ProjectForm);