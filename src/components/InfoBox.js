import React, { Component } from "react";
import axios from "axios";
import moment from "moment";
import styled from "styled-components";

const InfoBoxStyle = styled.div`
#data-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.box {
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
}

.heading {
  font-size: 2.5em;
  color: #2196F3;
}

.subtext {
  color: #64B5F6;
}

#left {
  margin-right: 48px;
}

#middle {
  padding: 0 48px;
  border-left: 1px solid #DAE1E9;
  border-right: 1px solid #DAE1E9;
}

#right {
  margin-left: 48px;
}
`;

class InfoBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPrice: null,
      monthChangeD: null,
      monthChangeP: null,
      updatedAt: null
    };
  }

  componentDidMount() {
    this.getData = () => {
      const { data } = this.props;
      const API_URL = "https://api.coindesk.com/v1/bpi/currentprice.json";

      axios.get(API_URL).then(res => {
        const price = res.data.bpi.USD.rate_float;
        const change = price - data[0].y;
        const changeP = (price - data[0].y) / data[0].y * 100;

        this.setState({
          currentPrice: res.data.bpi.USD.rate_float,
          monthChangeD: change.toLocaleString("us-EN", { style: "currency", currency: "USD" }),
          monthChangeP: changeP.toFixed(2) + "%",
          updatedAt: res.data.time.updated
        });
      }).catch(e => {
        console.log(e);
      });
    }

    this.getData();
    this.refresh = setInterval(() => this.getData(), 90000);
  }

  componentWillUnmount() {
    clearInterval(this.refresh);
  }

  render() {
    return (
      <InfoBoxStyle>
        <div id="data-container">
          {this.state.currentPrice ?
            <div id="left" className='box'>
              <div className="heading">{this.state.currentPrice.toLocaleString('us-EN', { style: 'currency', currency: 'USD' })}</div>
              <div className="subtext">{'Updated ' + moment(this.state.updatedAt).fromNow()}</div>
            </div>
            : null}
          {this.state.currentPrice ?
            <div id="middle" className='box'>
              <div className="heading">{this.state.monthChangeD}</div>
              <div className="subtext">Change Since Last Month (USD)</div>
            </div>
            : null}
          <div id="right" className='box'>
            <div className="heading">{this.state.monthChangeP}</div>
            <div className="subtext">Change Since Last Month (%)</div>
          </div>

        </div>
      </InfoBoxStyle>
    )
  }
}

export default InfoBox;