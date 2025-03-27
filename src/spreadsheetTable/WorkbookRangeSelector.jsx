import React from 'react'
//import WaitingLoader from './WaitingLoader'
import TableDragSelect2 from "./DragSelectTable2";

class WorkbookRangeSelector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      
      listenToDragSelectTable: false,
      selectedCells: [
      ]
    }

    this.handleRangeChanged = this.handleRangeChanged.bind(this)
  }

  handleRangeChanged(selectedCells){

    var { rows} = this.props

    this.setState(()=>({

      selectedCells: selectedCells
    }))

    var selectedRangeAddress = this.getSelectedRangeAddressText(rows, selectedCells)

    this.props.handleRangeChanged(selectedRangeAddress)
  }

  getSpreadsheetTablePreviewHtml() {

    var that = this
    var { rows} = this.props
    var { selectedCells, listenToDragSelectTable } = this.state
   
    if (rows.length <= 0) {
      
      return <div>
              <TableDragSelect2>
              </TableDragSelect2>
            </div>
    }


    var headerRows = []
    var tRows = []
 
    var noselectedCells = [[]]

    var tableRowCells = [<th className="tdcolnumber">{"#"}</th>]
    var headerCellText
    var headerCellIx = 0
    var rowWithMostColsCells = this.getRowWithMostColumns(rows).row
    for (var cellAddress0 in rowWithMostColsCells) {

      headerCellText = this.getLettersFromString(cellAddress0)
      tableRowCells.push(<th>{headerCellText}</th>)

      noselectedCells[0].push(false)

      headerCellIx++
    }

    headerRows.push(<tr className="headernamestablerow">{tableRowCells}</tr>)
    
    var rowCellsWithLetterAddressesOnly
    
    rows.forEach(function(rowCells, rowIx){

      tableRowCells = [<td className="tdcolnumber tdfixedheight">{rowIx+1}</td>]

      noselectedCells.push([])

      rowCellsWithLetterAddressesOnly = {}

      for (var cellAddress in rowWithMostColsCells) {

        rowCellsWithLetterAddressesOnly[that.getLettersFromString(cellAddress)] = ""
      }
      
      for (var cellAddressPresent in rowCells) {

        rowCellsWithLetterAddressesOnly[that.getLettersFromString(cellAddressPresent)] = rowCells[cellAddressPresent]

        noselectedCells[noselectedCells.length-1].push(false)
      }

      for (var cellAddressLetterOnly in rowCellsWithLetterAddressesOnly) {

        tableRowCells.push(<td><div className={"tdfixedheight"}>{rowCellsWithLetterAddressesOnly[cellAddressLetterOnly].substring(0, 50)}</div></td>)
      }

      tRows.push(<tr>{tableRowCells}</tr>)
    })

    var tableSelectedCellsValue = {...noselectedCells}
    if(listenToDragSelectTable === true){

        tableSelectedCellsValue = {...selectedCells}
    }
    
    return <div>
              <table className="headernamestable">
                <thead>{headerRows}</thead>
              </table>
            <TableDragSelect2
              value={tableSelectedCellsValue}
              onSelectionStart={selectedCells => this.setState({ selectedCells: noselectedCells, listenToDragSelectTable: true })}
              onChange={selectedCells => this.handleRangeChanged(selectedCells)}
              /*onChange={selectedCells => this.setState({ selectedCells })}*/>
              {tRows}
            </TableDragSelect2>
          </div>
  }

  getSelectedRangeAddressText(topRows, selectedCells){

    
    var {rows} = this.props

    if(!selectedCells || selectedCells.length === 0){

      return {startAddress:"", endAddress:""}
    }

    var that = this
    var selectedCellsWithoutColumn1 = {}
    var row
    for(var rowIx in selectedCells){

      row = selectedCells[rowIx]
      selectedCellsWithoutColumn1[rowIx] = row.slice(1, row.length)
    }

    var startAddress
    var endAddress
    var cellIx = 0
    var row
    var rowIx = 0

    var rowWithMostColsCells = this.getRowWithMostColumns(rows).row

    rows.forEach(function(row, rowIx){

      cellIx = 0

      row = that.getRowPadded(row, rowIx, rowWithMostColsCells)

      for(var cellAddress in row){

        if(selectedCellsWithoutColumn1[rowIx][cellIx] === true && !startAddress){

          startAddress = cellAddress
        }

        if(selectedCellsWithoutColumn1[rowIx][cellIx] === true){

          endAddress = cellAddress
        }

        cellIx++
      }

    })

    startAddress = startAddress || ""
    endAddress = endAddress || startAddress
    endAddress = endAddress || ""

    return {startAddress:startAddress, endAddress:endAddress}
  }

  getRowPadded(row, rowIX, rowWithMostColsCells){

    var cloneRow = {...row}
    var rowCellAddress = ""
    for(var cellAddress in rowWithMostColsCells){

      rowCellAddress = this.getLettersFromString(cellAddress) + (rowIX+1)

      if(cloneRow[rowCellAddress] == null){

        cloneRow[rowCellAddress] = ""
      }
    }

    return cloneRow 
  }

  getRowWithMostColumns(topRows) {

    var rowCellCount = 0
    var retCellCount = 0
    var retRowObj = {}
    topRows.forEach(function(row){

      rowCellCount = 0
      for(var cellAddress in row){

        rowCellCount++
      }

      if(rowCellCount > retCellCount){

        retCellCount = rowCellCount
        retRowObj = {...row}
      }
    })

    return {row:retRowObj, cellCount:retCellCount}
  }

  getLettersFromString(str) {

    return str.replace(/[0-9]/g, '')
  }

  render() {

    var previewTable = this.getSpreadsheetTablePreviewHtml()

    return (
      <div>
        <div className="row">
          <div className="col-md-12">
              <div>
                {previewTable}
              </div>
          </div>
        </div>
      </div>
    )
  }
}

WorkbookRangeSelector.defaultProps = {
  rows: [],
  handleRangeChanged : function(){}
}

export default WorkbookRangeSelector
