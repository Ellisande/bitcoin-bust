import React from 'react';
import { XYChart, LineSeries, XAxis, YAxis, LinearGradient } from '@data-ui/xy-chart';

const PriceChart = props =>
  <XYChart
    width={500}
    height={300}
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
      data={props.data}
      fill="url('#my_fancy_gradient')"
    />
  </XYChart>;

export default PriceChart;
