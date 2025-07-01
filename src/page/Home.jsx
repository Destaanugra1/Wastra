import React from 'react';
import Navbar from '../components/Navbar';
import Layer1 from '../components/Home/Layer1';
import Layer2 from '../components/Home/Layer2';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
    <Navbar />
      <div className="">
        <Layer1 />
      </div>
      <div className="">
        <Layer2 />
      </div>
    </>
  );
};

export default Home;
