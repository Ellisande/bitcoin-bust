import React, { Component } from 'react';
import firebase from 'firebase';

var config = {
  apiKey: "AIzaSyB9nTWm22gfTjlRBNxBltHwNt9ko5oHqDk",
  authDomain: "bitcoin-bust.firebaseapp.com",
  databaseURL: "https://bitcoin-bust.firebaseio.com",
  projectId: "bitcoin-bust",
  storageBucket: "bitcoin-bust.appspot.com",
  messagingSenderId: "658035671724"
};
firebase.initializeApp(config);

const withFirebaseHoc = path => WrappedComponent => {
  class withFirebase extends Component {
    constructor(props){
      super(props);
      this.state = {
        data: {},
        ref: firebase.database().ref(path)
      };
    }
    componentDidMount(){
      this.state.ref.once('value').then( snap => {
        this.setState({data: snap.val() });
      });
      this.state.ref.on('child_changed', snap => {
        this.setState({data: snap.val() });
      })
    }
    render(){
      const firebaseProps = {[path]: this.state.data};
      return (<WrappedComponent {...this.props} {...firebaseProps}/>);
    }
    componentWillUnmount(){
      this.state.ref.off();
    }
  }
  return withFirebase;
}

export default withFirebaseHoc;
