import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import './Register.css';
import axios from 'axios';

// Convert "09:00 AM" -> "09:00" (for time input display)
const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (modifier === 'PM' && hours !== '12') hours = String(+hours + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Convert "14:00" -> "02:00 PM" (for formData)
const convertTo12Hour = (time24h) => {
  if (!time24h) return '';
  let [hours, minutes] = time24h.split(':');
  const modifier = +hours >= 12 ? 'PM' : 'AM';
  hours = (+hours % 12 || 12).toString().padStart(2, '0');
  return `${hours}:${minutes} ${modifier}`;
};


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    name: '',
    logo: '',
    icon: '',
    latitude: '',
    longitude: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    type: 'both',
    userId: '',
    appointment: [
      { day: 'Monday', startTime: '', endTime: '' },
      { day: 'Tuesday', startTime: '', endTime: '' },
      { day: 'Wednesday', startTime: '', endTime: '' },
      { day: 'Thursday', startTime: '', endTime: '' },
      { day: 'Friday', startTime: '', endTime: '' },
      { day: 'Saturday', startTime: '', endTime: '' },
      { day: 'Sunday', startTime: '', endTime: '' },
    ],
    token: [
      { day: 'Tuesday', startTokenNo: '', endTokenNo: '' }
    ],
    reviews: [
      { name: '', userId: '', rating: '', comment: '' }
    ]
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.country) {
      const result = State.getStatesOfCountry(formData.country);
      setStates(result);
      setCities([]);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      const result = City.getCitiesOfState(formData.country, formData.state);
      setCities(result);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state,formData.country]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAppointmentChange = (index, field, value) => {
    const updated = [...formData.appointment];
    updated[index][field] = value;
    setFormData({ ...formData, appointment: updated });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    const payload = {
      category: formData.category,
      subcategory: formData.subcategory,
      name: formData.name,
      logo: formData.logo,
      icon: formData.icon,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country,
      userId: formData.userId,
      type: formData.type,
      appointment: formData.appointment.map(item => ({
        day: item.day,
        startTime: convertTo12Hour(item.startTime),
        endTime: convertTo12Hour(item.endTime)
      })),
      token: formData.token.map(item => ({
        day: item.day,
        startTokenNo: item.startTokenNo,
        endTokenNo: item.endTokenNo
      })),
      reviews: formData.reviews.map(item => ({
        name: item.name,
        userId: item.userId,
        rating: item.rating,
        comment: item.comment
      }))
    };
  
    try {
      const response = await axios.post('https://confirmslot.com/service-provider', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        alert('Form submitted successfully!');
      } else {
        alert('Failed to submit form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form');
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
    <input name="category" placeholder="Category" onChange={handleChange} />
    <input name="subcategory" placeholder="Subcategory" onChange={handleChange} />
    <input name="name" placeholder="Clinic Name" onChange={handleChange} />
    <input name="logo" placeholder="Logo URL" onChange={handleChange} />
    <input name="icon" placeholder="Icon URL" onChange={handleChange} />
    <input name="latitude" placeholder="Latitude" onChange={handleChange} />
    <input name="longitude" placeholder="Longitude" onChange={handleChange} />
    <input name="addressLine1" placeholder="Address Line 1" onChange={handleChange} />
    <input name="addressLine2" placeholder="Address Line 2" onChange={handleChange} />
  
    <select name="country" onChange={handleChange} value={formData.country}>
      <option value="">Select Country</option>
      {countries.map((c) => (
        <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
      ))}
    </select>
  
    <select name="state" onChange={handleChange} value={formData.state} disabled={!states.length}>
      <option value="">Select State</option>
      {states.map((s) => (
        <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
      ))}
    </select>
  
    <select name="city" onChange={handleChange} value={formData.city} disabled={!cities.length}>
      <option value="">Select City</option>
      {cities.map((c, index) => (
        <option key={index} value={c.name}>{c.name}</option>
      ))}
    </select>
  
    <input name="pincode" placeholder="Pincode" onChange={handleChange} />
    <select name="type" onChange={handleChange} value={formData.type}>
      <option value="token">Token</option>
      <option value="appointment">Appointment</option>
      <option value="both">Both</option>
    </select>
  
    <input name="userId" placeholder="User ID" onChange={handleChange} />
  
    <h4>Appointments</h4>
    {formData.appointment.map((item, index) => (
      <div key={index} className="appointment-row">
        <label>{item.day}</label>
        <input
          type="time"
          value={convertTo24Hour(item.startTime)}
          onChange={(e) =>
            handleAppointmentChange(index, 'startTime', convertTo12Hour(e.target.value))
          }
        />
        <input
          type="time"
          value={convertTo24Hour(item.endTime)}
          onChange={(e) =>
            handleAppointmentChange(index, 'endTime', convertTo12Hour(e.target.value))
          }
        />
      </div>
    ))}
  
    <h4>Token</h4>
    <input placeholder="Start Token No" onChange={(e) => setFormData({ ...formData, token: [{ ...formData.token[0], startTokenNo: e.target.value }] })} />
    <input placeholder="End Token No" onChange={(e) => setFormData({ ...formData, token: [{ ...formData.token[0], endTokenNo: e.target.value }] })} />
  
    <h4>Review</h4>
    <input placeholder="Reviewer Name" onChange={(e) => setFormData({ ...formData, reviews: [{ ...formData.reviews[0], name: e.target.value }] })} />
    <input placeholder="Review User ID" onChange={(e) => setFormData({ ...formData, reviews: [{ ...formData.reviews[0], userId: e.target.value }] })} />
    <input placeholder="Rating" onChange={(e) => setFormData({ ...formData, reviews: [{ ...formData.reviews[0], rating: parseFloat(e.target.value) }] })} />
    <textarea placeholder="Comment" onChange={(e) => setFormData({ ...formData, reviews: [{ ...formData.reviews[0], comment: e.target.value }] })} />
  
    <button type="submit" className="submit-btn">Submit</button>
  </form>
  
  );
};

export default RegisterForm;