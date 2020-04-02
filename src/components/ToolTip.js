import React, { Component } from "react";
import styled from "styled-components";

const ToolTipStyle = styled.div`
.hover {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  padding: 5px;
  border-radius: 4px;
  background-color: #2196F3;
  color: white;

  &.price {
    font-weight: 700;
  }
}
`;

class ToolTip extends Component {
  render() {
    const { hoverLoc, activePoint } = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();

    let placementStyles = {};
    let width = 100;
    placementStyles.width = width = "px";
    placementStyles.left = hoverLoc + svgLocation.left - (width / 2);

    return (
      <ToolTipStyle>
        <div className='hover' style={placementStyles}>
          <div className='date'>{activePoint.d}</div>
          <div className='price'>{activePoint.p}</div>
        </div>
      </ToolTipStyle>
    );
  }
}

export default ToolTip;