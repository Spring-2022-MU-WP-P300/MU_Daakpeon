import React, { Component } from 'react';
import './App.css';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';


class App extends Component {
  render() {
    return (
      <>
      <Navbar/>
      <Landing/>
      <Footer/>
      </>
    )
  }
}

export default App; 
