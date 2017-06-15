import React, { Component } from 'react';
import firebase from 'firebase';
import _ from 'lodash';

var config = {
  apiKey: "AIzaSyB9nTWm22gfTjlRBNxBltHwNt9ko5oHqDk",
  authDomain: "bitcoin-bust.firebaseapp.com",
  databaseURL: "https://bitcoin-bust.firebaseio.com",
  projectId: "bitcoin-bust",
  storageBucket: "bitcoin-bust.appspot.com",
  messagingSenderId: "658035671724"
};
firebase.initializeApp(config);

const withDataHoc = (path, propName) => WrappedComponent => {
  class withFirebase extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: {},
        ref: firebase.database().ref(path)
      };
    }
    componentWillMount(){
      this.state.ref.once('value').then( snap => {
        this.setState({data: snap.val() });
      });
      this.state.ref.on('value', snap => {
        this.setState({data: snap.val() });
      })
    }
    render(){
      const firebaseProps = {[propName || path]: this.state.data};
      return (<WrappedComponent {...this.props} {...firebaseProps}/>);
    }
    componentWillUnmount(){
      this.state.ref.off();
    }
  }
  return withFirebase;
}

const withUserDataHoc = (path, propName) => WrappedComponent => {
  class withUserData extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: {},
        ref: firebase.database().ref(`users/${props.user}/${path}`)
      };
    }
    componentWillMount(){
      this.state.ref.once('value').then( snap => {
        this.setState({data: snap.val() });
      });
      this.state.ref.on('value', snap => {
        this.setState({data: snap.val() });
      })
    }
    render(){
      const firebaseProps = {[propName || path]: this.state.data};
      return (<WrappedComponent {...this.props} {...firebaseProps}/>);
    }
    componentWillUnmount(){
      this.state.ref.off();
    }
  }
  return withUserData;
}

const withDataUpdateHoc = (path, propName) => WrappedComponent => {
  class withFirebaseUpdate extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: {},
        ref: firebase.database().ref(path)
      };
    }
    render(){
      const updateProps = {[propName || path]: this.state.ref.transaction.bind(this.state.ref)};
      return (<WrappedComponent {...this.props} {...updateProps}/>);
    }
  }
  return withFirebaseUpdate;
}

const withUpdateUserDataHoc = (path, propName) => WrappedComponent => {
  class withUpdateUserData extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: {},
        ref: firebase.database().ref(`users/${props.user}/${path}`)
      };
    }
    render(){
      const updateProps = {[propName || path]: this.state.ref.transaction.bind(this.state.ref)};
      return (<WrappedComponent {...this.props} {...updateProps}/>);
    }
  }
  return withUpdateUserData;
}

const withAddUserHoc = WrappedComponent => {
  class withAddUser extends Component {
    render(){
      const addUser = user => {
        firebase.database().ref(`users/${user}`).transaction( existingUser => {
          if(existingUser){
            return existingUser;
          }
          return {
            usd: 100,
            btc: 5,
          };
        });
      }
      return (<WrappedComponent {...this.props} addUser={addUser} />);
    }
  }
  return withAddUser;
}

const withIncreasePriceHoc = WrappedComponent => {
  const withIncreasePrice = props => {
    const updatePrice = () => {
      const velocity = Math.log10(props.buysPerSecond);
      props.updatePrice( oldPrice => oldPrice + velocity );
      props.updateHistory( props.price );
      props.updateBuysPerSecond( oldBuysPerSecond => oldBuysPerSecond + 1);
      setTimeout( () => props.updateBuysPerSecond( bps => bps -1), 1000);

    }
    return (
      <WrappedComponent {... props} increasePrice={updatePrice} />
    );
  }
  return _.flow(
    withDataHoc('exchange/price', 'price'),
    withDataHoc('exchange/buysPerSecond', 'buysPerSecond'),
    withDataUpdateHoc('exchange/price', 'updatePrice'),
    withDataUpdateHoc('exchange/buysPerSecond', 'updateBuysPerSecond'),
    withHistoryUpdateHoc,
  )(withIncreasePrice);
}

const withDecreasePriceHoc = WrappedComponent => {
  const withDecreasePrice = props => {
    const updatePrice = () => {
      const velocity = Math.log10(props.sellsPerSecond);
      props.updatePrice( oldPrice => oldPrice - velocity < 1 ? 1 : oldPrice - velocity );
      props.updateHistory( props.price );
      props.updateSellsPerSecond( sellsPerSecond => sellsPerSecond + 1);
      setTimeout( () => props.updateSellsPerSecond( sps => sps -1), 1000);
    }
    return (
      <WrappedComponent {... props} decreasePrice={updatePrice} />
    );
  }
  return _.flow(
    withDataHoc('exchange/price', 'price'),
    withDataHoc('exchange/sellsPerSecond', 'sellsPerSecond'),
    withDataUpdateHoc('exchange/price', 'updatePrice'),
    withDataUpdateHoc('exchange/sellsPerSecond', 'updateSellsPerSecond'),
    withHistoryUpdateHoc,
  )(withDecreasePrice);
}

const withHistoryHoc = propName => WrappedComponent => {
  class withHistory extends Component {
    constructor(props){
      super(props);
      this.state = {
        history: [],
        ref: firebase.database().ref('exchange/history')
      };
    }
    componentWillMount(){
      this.state.ref.limitToLast(100).on('child_added', snap => {
        this.setState( oldState => ({history: [...oldState.history, snap.val()]}));
      })
    }
    render(){
      const firebaseProps = {[propName || 'history']: this.state.history};
      return (<WrappedComponent {...this.props} {...firebaseProps}/>);
    }
    componentWillUnmount(){
      this.state.ref.off();
    }
  }
  return withHistory;
}

const withHistoryUpdateHoc = WrappedComponent => {
  class withHistoryUpdate extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: {},
        ref: firebase.database().ref('exchange/history')
      };
    }
    render(){
      const updateHistory = price => {
        this.state.ref.push( {price, time: firebase.database.ServerValue.TIMESTAMP })
      }
      const updateProps = {updateHistory};
      return (<WrappedComponent {...this.props} {...updateProps}/>);
    }
  }
  return withHistoryUpdate;
}

export {
  withDataHoc as withData,
  withUserDataHoc as withUserData,
  withDataUpdateHoc as withDataUpdate,
  withUpdateUserDataHoc as withUpdateUserData,
  withIncreasePriceHoc as withIncreasePrice,
  withDecreasePriceHoc as withDecreasePrice,
  withHistoryUpdateHoc as withHistoryUpdate,
  withAddUserHoc as withAddUser,
  withHistoryHoc as withHistory,
};
