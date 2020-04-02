import React, { Component } from "react";
import axios from "axios";
import moment from "moment";
import styled from "styled-components";
import { InfoBox, LineChart, ToolTip } from "./components";

const AppStyle = styled.div`
.row {
  display: flex;
  justify-content: center;
}

h1 {
  padding: 0;
  margin: 0;
  font-weight: 700;
  color: #757575;
}

#coindesk {
  font-weight: 300;
}

#coindesk a {
  text-decoration: none;
  color: inherit;
}

.popup {
  min-height: 50px;
}
`;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fetchingData: true,
      data: null,
      hoverLoc: null,
      activePoint: null
    }
  }

  handleChartHover(hoverLoc, activePoint) {
    this.setState({ hoverLoc, activePoint });
  }

  componentDidMount() {
    const getData = () => {
      const API_URL = "https://api.coindesk.com/v1/bpi/historical/close.json"
      axios.get(API_URL).then(res => {
        const sortedData = [];
        let count = 0;
        for (const date in res.data.bpi) {
          sortedData.push({
            d: moment(date).format("MMM DD"),
            p: res.data.bpi[date].toLocaleString("us-EN", { style: "currency", currency: "USD" }),
            x: count,
            y: res.data.bpi[date]
          });
          count++;
        }

        this.setState({
          data: sortedData,
          fetchingData: false
        });
      }).catch(e => {
        console.log(e);
      });
    }

    getData();
  }

  render() {
    return (
      <AppStyle>
        <div className="container">
          <div className="row">
            <h1>30 Day Bitcoin Price Chart</h1>
          </div>
          <div className="row">
            {!this.state.fetchingData ?
              <InfoBox data={this.state.data} />
              : null}
          </div>
          <div className="row">
            <div className="popup">
              {this.state.hoverLoc ? <ToolTip hoverLoc={this.state.hoverLoc} activePoint={this.state.activePoint} /> : null}
            </div>
          </div>
          <div className="row">
            <div className="chart">
              {!this.state.fetchingData ?
                <LineChart data={this.state.data} onChartHover={(a, b) => this.handleChartHover(a, b)} />
                : null}
            </div>
          </div>
          <div className="row">
            <div id="coindesk"> Powered by <a href="http://www.coindesk.com/price/">CoinDesk</a></div>
          </div>
        </div>
      </AppStyle>
    );
  }
}

export default App;