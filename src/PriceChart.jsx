import React from 'react';
import { XYChart, LineSeries, XAxis, YAxis, LinearGradient } from '@data-ui/xy-chart';
import _ from 'lodash';
import withScreenSize from './withScreenSize'
import { withData } from './withFirebase';

const PriceChart = props =>{
  const data = _.isEmpty(props.data) ? [] : _.toArray(props.data);
  return (
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
        data={data.map(dataPoint => ({y: dataPoint.price, x: new Date(dataPoint.time)})).splice(-100)}
        fill="url('#my_fancy_gradient')"
      />
    </XYChart>
  );
}

export default _.flow(withScreenSize, withData('exchange/history', 'data'))(PriceChart);
