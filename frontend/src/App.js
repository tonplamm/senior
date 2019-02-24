import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom'

import './css/App.css';

import Feed from './components/Feed'
import Register from './components/Register'
import Report from './components/Report'
import Review from './components/Review'
import ReviewCompany from './components/ReviewCompany'
import FAQ from './components/Faq'

import Error from './components/Error'

import Navigation from './components/Navigation'


class App extends Component {

  test=(a)=>{
console.log(a)  }
  render() {
    return (
      <Router>
        <div className="">

          <Navigation></Navigation>
          <Switch>
            <Route path='/' component={Feed} exact />
            <Route path='/Login' component={Register} />
            <Route path='/Signup' component={Register} />
            <Route path='/Report' component={Report} />
            <Route path='/Review/:company' component={ReviewCompany}/>
            <Route path='/Review' component={Review} />
            <Route path='/FAQ' component={FAQ} />

            <Route component={Error} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
