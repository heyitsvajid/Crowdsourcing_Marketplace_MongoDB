import React, { Component } from 'react';
import '../assets/css/bootstrap.css'
import { withRouter } from 'react-router-dom'

class TableHeader extends Component {
  render() {
    return (
            <th className='tableHeader' >{(this.props.tableHeaderValue).toUpperCase()}</th>
          );
  }
}
export default withRouter(TableHeader);