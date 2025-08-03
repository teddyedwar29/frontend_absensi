import React, { useState } from 'react';

const AddSalesForm = ({ onFormSubmit }) => {
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit({ nama, jabatan, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Lengkap" className="swal2-input" />
      <input type="text" value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Jabatan" className="swal2-input" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="swal2-input" />
    </form>
  );
};

export default AddSalesForm;