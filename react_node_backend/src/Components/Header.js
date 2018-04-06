import React, { Component } from 'react';
import '../assets/css/header.css'
import '../assets/css/dropdown.css'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { withRouter } from 'react-router-dom'
import swal from 'sweetalert2'
import { envURL, reactURL } from '../config/environment';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    }
  }
  logout(e) {
    e.preventDefault();
    localStorage.clear();
    let url = envURL+'logout';
    localStorage.setItem('email', '');
    axios.get(url, { withCredentials: true })
      .then(res => {
        // eslint-disable-next-line
        if (res.data == 'Logout') {
          this.props.history.push('/');
          swal({
            type: 'success',
            title: 'Logout',
            text: 'Successfully Logged Out',
          })
        }

      })
      .catch(err => {
        console.error(err);
      });

  }
  handleSearch(e) {
    e.preventDefault();
    this.props.history.push({
      pathname: '/search',
      search: '?query=' + this.state.search
    })

  }
  handleUserInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value })

  }
  render() {
    return (
      <div>
        <header>
          <nav className="nav dark-nav fixed-top">
            <div className="container">
              <div className="nav-heading">
                <img className="logo" src="https://cdn6.f-cdn.com/build/icons/fl-logo.svg" alt="" height="40" width="170" />
                <form class="form-inline">

                </form>
              </div>
              <div className="menu" id="open-navbar1">
                <ul className="list">
                  <li><input class="form-control mt-3" type="search" placeholder="Search" aria-label="Search"
                    onChange={this.handleUserInput} name='search' /></li>
                  <li>    <button class="btn btn-outline-success mt-3 ml-2" type="button" onClick={this.handleSearch.bind(this)}>Search</button></li>

                  <li><Link to='/home'><a className={this.props.home}>Home</a></Link ></li>
                  <li ><Link to='/dashboard'><a className={this.props.dashboard}>Dashboard</a></Link></li>
                  {/* <li ><Link to='/myprojects'><a className={this.props.myprojects}>My Projects</a></Link></li> */}
                  <li>    <Link to="/postproject">  <button type="button" class="btn btn-primary">Post Project</button></Link>
                  </li>
                  <li class="dropdown mr-2">
                    <a data-toggle="dropdown" class="dropdown-toggle"> <b class="caret">Hi, {localStorage.getItem('name')}</b></a>
                    <h3> </h3>
                    <ul class="dropdown-menu" >
                    
                      <Link to="/profile">  <li><a >My Profile</a></li></Link>
                      <Link to="/wallet">  <li><a >Manage Wallet</a></li></Link>
                      <li><a href='' onClick={this.logout.bind(this)}>Logout</a></li>
                      <li class="divider"></li>
                    </ul>
                  </li>

                </ul>
              </div>
            </div>
          </nav>
        </header>
        <br /><br /><br />
      </div>
    );
  }

}


export default withRouter(Header);
