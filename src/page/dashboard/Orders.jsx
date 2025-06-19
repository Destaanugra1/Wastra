import Sidebar from '../../components/Sidebar';
import PurchaseHistory from '../../components/OrderCek';
import React from 'react';

const Orders = () => {
  return (
    <div style={{ display: 'flex' }}>
      <div>
        <Sidebar />
      </div>
      <div style={{ flex: 1 }}>
        <PurchaseHistory />
      </div>
    </div>
  );
};

export default Orders;
