import React, { Component } from "react";
import styled from "styled-components";

const LineChartStyle = styled.div`
.linechart {
  padding: 8px;
}

.linechart_path {
  stroke-width: 3;
  fill: none;
}

.linechart_axis {
  stroke: #BDC3C7;
}

.linechart_point {
  fill: #FFF;
  stroke-width: 2;
}

.linechart_area {
  padding: 8px;
  fill: #6DB5F6;
  stroke: none;
  opacity: 0.4;
}

.linechart_label {
  fill: #64B5F6;
  font-weight: 700;
}

.hoverLine {
  stroke-width: 1;
  stroke: #7D95B6;
}
`;


/**
 * @todo
 * Render chart.js LineChart component instead of custom svg
 */

class LineChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverLoc: null,
      activePoint: null
    };
  }

  // Get x, y, max, min points
  getX() {
    const { data } = this.props;
    return {
      min: data[0].x,
      max: data[data.length - 1].x
    };
  }

  getY() {
    const { data } = this.props;
    return {
      min: data.reduce((min, p) => p.y < min ? p.y : min, data[0].y),
      max: data.reduce((max, p) => p.y < max ? p.y : max, data[0].y)
    };
  }

  // Get svg coordinates
  getSvgX(x) {
    const { svgWidth, yLabelSize } = this.props;
    return yLabelSize + (x / this.getX().max * (svgWidth, yLabelSize));
  }

  getSvgY(y) {
    const { svgHeight, xLabelSize } = this.props;
    const gY = this.getY();
    return ((svgHeight - xLabelSize) * gY.max - (svgHeight - xLabelSize) * y) / (gY.max - gY.min);
  }

  // Build svg path
  makePath() {
    const { data, color } = this.props;
    let pathD = `M ${this.getSvgX(data[0].x)} ${this.getSvgY(data[0].y)} `;

    pathD += data.map((point, i) => {
      return `L ${this.getSvgX(point.x)} ${this.getSvgY(point.y)} `
    }).join("");

    return (
      <path className="linechart_path" d={pathD} style={{ stroke: color }} />
    );
  }

  // Build shaded area
  makeArea() {
    const { data } = this.props;
    let pathD = `M ${this.getSvgX(data[0].x)}${this.getSvgY(data[0].y)} `;

    pathD += data.map((point, i) => {
      return `L ${this.getSvgX(point.x)} ${this.getSvgY(point.y)} `;
    }).join("");

    const x = this.getX();
    const y = this.getY();
    pathD += `L ${this.getSvgX(x.max)} ${this.getSvgY(y.min)} L ${this.getSvgX(x.min)} ${this.getSvgY(y.min)} `;

    return <path className="linechart_area" d={pathD} />
  }

  makeAxis() {
    const { yLabelSize } = this.props;
    const x = this.getX();
    const y = this.getY();

    return (
      <g className="linechart_axis">
        <line
          x1={this.getSvgX(x.min) - yLabelSize} y1={this.getSvgY(y.min)}
          x2={this.getSvgX(x.max)} y2={this.getSvgY(y.min)}
          strokeDasharray="5" />
        <line
          x1={this.getSvgX(x.min) - yLabelSize} y1={this.getSvgY(y.max)}
          x2={this.getSvgX(x.max)} y2={this.getSvgY(y.max)}
          strokeDasharray="5" />
      </g>
    );
  }

  makeLabels() {
    const { svgHeight, svgWidth, xLabelSize, yLabelSize } = this.props;
    const padding = 5;
    return (
      <g className="linechart_label">
        {/* y axis labels */}
        <text transform={`translate(${yLabelSize / 2}, 20)`} textAnchor="middle">
          {this.getY().max.toLocaleString('us-EN', { style: 'currency', currency: 'USD' })}
        </text>
        <text transform={`translate(${yLabelSize / 2}, ${svgHeight - xLabelSize - padding})`} textAnchor="middle">
          {this.getY().min.toLocaleString('us-EN', { style: 'currency', currency: 'USD' })}
        </text>
        {/* x axis labels */}
        <text transform={`translate(${yLabelSize}, ${svgHeight})`} textAnchor="start">
          {this.props.data[0].d}
        </text>
        <text transform={`translate(${svgWidth}, ${svgHeight})`} textAnchor="end">
          {this.props.data[this.props.data.length - 1].d}
        </text>
      </g>
    )
  }

  // Get closest point to mouse cursor
  getCoords(e) {
    const { svgWidth, data, yLabelSize } = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();
    const adjustment = (svgLocation.width - svgWidth) / 2; //takes padding into consideration
    const relativeLoc = e.clientX - svgLocation.left - adjustment;

    let svgData = [];
    data.forEach(point => {
      svgData.push({
        svgX: this.getSvgX(point.x),
        svgY: this.getSvgY(point.y),
        d: point.d,
        p: point.p
      });
    });

    let closestPoint = {};
    for (let i = 0, c = 500; i < svgData.length; i++) {
      if (Math.abs(svgData[i].svgX - this.state.hoverLoc) <= c) {
        c = Math.abs(svgData[i].svgX - this.state.hoverLoc);
        closestPoint = svgData[i];
      }
    }

    if (relativeLoc - yLabelSize < 0) {
      this.stopHover();
    } else {
      this.setState({
        hoverLoc: relativeLoc,
        activePoint: closestPoint
      })
      this.props.onChartHover(relativeLoc, closestPoint);
    }
  }


  // Stop hover
  stopHover() {
    this.setState({ hoverLoc: null, activePoint: null });
    this.props.onChartHover(null, null);
  }

  // Make active point
  makeActivePoint() {
    const { color, pointRadius } = this.props;
    return (
      <circle
        className='linechart_point'
        style={{ stroke: color }}
        r={pointRadius}
        cx={this.state.activePoint.svgX}
        cy={this.state.activePoint.svgY}
      />
    );
  }

  // Make hover line
  createLine() {
    const { svgHeight, xLabelSize } = this.props;
    return (
      <line className='hoverLine'
        x1={this.state.hoverLoc} y1={-8}
        x2={this.state.hoverLoc} y2={svgHeight - xLabelSize} />
    )
  }

  render() {
    const { svgHeight, svgWidth } = this.props;

    return (
      <LineChartStyle>
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className={'linechart'}
          onMouseLeave={() => this.stopHover()}
          onMouseMove={(e) => this.getCoords(e)} >
          <g>
            {this.makeAxis()}
            {this.makePath()}
            {this.makeArea()}
            {this.makeLabels()}
            {this.state.hoverLoc ? this.createLine() : null}
            {this.state.hoverLoc ? this.makeActivePoint() : null}
          </g>
        </svg>
      </LineChartStyle>
    );
  }
}

LineChart.defaultProps = {
  data: [],
  color: "#2196F3",
  pointRadius: 5,
  svgHeight: 300,
  svgWidth: 900,
  xLabelSize: 20,
  yLabelSize: 80
}

export default LineChart;