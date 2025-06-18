import React from 'react';
import Icon from '../../assets/icon.png';
import HeroImg from '../../assets/HeroImg.jpg';

const Layer1 = () => {
  return (
    <div className='w-full min-h-screen flex flex-col md:flex-row bg-[#a6603a]'>
      {/* Kiri: Konten */}
      <div className='flex-1 flex flex-col justify-center px-8 md:px-20 py-12 md:py-0'>
        <div className='mb-8 flex items-center'>
          <img src={Icon} alt='Wastra Logo' className='h-10  md:h-50 mr-4' />
        </div>
        <h1 className='text-white text-3xl md:text-5xl font-bold mb-8 max-w-xl leading-tight drop-shadow'>
          Wastra Batik Indonesia, dari hati kami untukmu.
        </h1>
        <a
          href='/toko'
          className='inline-block border border-white text-white px-8 py-3 rounded transition hover:bg-white hover:text-[#a6603a] font-semibold text-lg md:text-xl'>
          SHOP NOW
        </a>
      </div>
      {/* Kanan: Gambar */}
      <div className='flex-1 flex items-center justify-center bg-[#a6603a] md:bg-transparent md:pr-12'>
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full md:w-[420px] md:h-[600px] flex items-end justify-center'>
          <img
            src={HeroImg}
            alt='Batik Model'
            className='object-cover w-full h-full'
          />
        </div>
      </div>
    </div>
  );
};

export default Layer1;
