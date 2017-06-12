import React from 'react';
import { XYChart, LineSeries, XAxis, YAxis, LinearGradient } from '@data-ui/xy-chart';
import withScreenSize from './withScreenSize'

const PriceChart = props =>
  <XYChart
    width={props.screenWidth}
    height={props.screenHeight * 0.5}
    xScale={{ type: 'time' }}
    yScale={{ type: 'linear' }}
    ariaLabel="Bitcoin Price"
  >
    <LinearGradient
      id="my_fancy_gradient"
      from={'blue'}
      to={'red'}
    />
    <XAxis label="Seconds" />
    <YAxis label="Price" />
    <LineSeries
      label="BTC Price"
      data={props.data.splice(-100)}
      fill="url('#my_fancy_gradient')"
    />
  </XYChart>;

export default withScreenSize(PriceChart);
