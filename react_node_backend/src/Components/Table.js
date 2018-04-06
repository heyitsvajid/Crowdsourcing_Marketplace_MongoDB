import React, { Component } from 'react';
import TableHeader from './TableHeader'
import CustomRow from './CustomRow'
import { withRouter } from 'react-router-dom'


class Table extends Component {

  render() {
    let headerNodes = this.props.tableHeaderData.map(headerData => {
      return (
        <TableHeader tableHeaderValue={headerData} >
        </TableHeader>
      )
    });

    let rowNodes = this.props.tableRowData.map(rowData => {
      return (

        <CustomRow action={this.props.action} rowData={rowData} >
        </CustomRow>
      )
    });

    return (
      <div class="panel-body">
        <div class="table-responsive">
          <table class="table table-striped" align='center'>
            <thead>
              <tr align='center'>
                {headerNodes}
              </tr>
            </thead>

            {rowNodes}

          </table>
        </div>
      </div>

    );
  }
}
export default withRouter(Table);