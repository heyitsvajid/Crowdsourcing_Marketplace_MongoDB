import React, { Component } from 'react';
import axios, { post } from 'axios';
import swal from 'sweetalert2'
import { withRouter } from 'react-router-dom'
import { envURL, reactURL } from '../config/environment';

class Submission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      successMessage: '',
      errorMessage: '',
    };
    this._handleFileChange = this._handleFileChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  componentWillMount() {
    let getprofileImageAPI = envURL+'getProfileImage';
    let id = localStorage.getItem('id');
    if (id) {
      var apiPayload = {
        id: id
      }
      axios.post(getprofileImageAPI, apiPayload)
        .then(res => {
          console.log(res.data);
          if (res.data.errorMsg != '') {
            console.log('No Image Found');
          } else {
            this.setState({
              requireImagePath: res.data.data.src
            });
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
  renderRows() {
    if (this.state.errorMessage != '') {
      return (
        <p class="text-danger" >{this.state.errorMessage}</p>
      );
    } else if (this.state.successMessage != '') {
      return (
        <p class="alert alert-success" >{this.state.errorMessage}</p>
      );
    }
  }
  _handleSubmit(e) {
    e.preventDefault();
    // TODO: do something with -> this.state.file
    let uploadAPI = envURL+'uploadSubmissionDocument';
    const formData = new FormData();
    formData.append('text',this.state.detail);
    formData.append('file', this.state.file);
    formData.append('project_id', localStorage.getItem('currentProjectId'));
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    post(uploadAPI, formData, config).then(function (res) {
      if (res.data.errorMsg != '') {
        swal({
          type: 'error',
          text: res.data.errorMsg,
        })
      } else if (res.data.successMsg != '') {
        swal({
          type: 'success',
          text: res.data.successMsg,
          detail:''
        })

      }
    });
  }

  _handleFileChange(e) {
    e.preventDefault();

    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    // eslint-disable-next-line
    if (file.type == 'application/zip') {
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
        text: 'Only ZIP attachments allowed',
      })
    }
  }

  handleUserInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value })

  }
render() {


    return (
      <div>
          <h3 class='mt-2'>Submit Documents Here</h3><h6> (.zip)</h6>
        <form onSubmit={this._handleSubmit}>
        <br/>
        
        <strong>Detail:</strong>
        <br/>
                    <input type="text" name="detail" className="form-control" placeholder="Details" required="" autoFocus=""
                        value={this.state.name} onChange={this.handleUserInput} />
          <input class='form-control mt-3' type="file" onChange={this._handleFileChange} required='' /><br />
          <button type="submit" class="btn btn-primary mt-2" value="Upload Document" onClick={this._handleSubmit}>Upload Document</button>
        </form>
      </div>
    )
  }

}

export default withRouter(Submission);