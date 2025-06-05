import { Button, Box, Typography } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import './Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const convertTo24Hour = (time12h) => {
  if (!time12h) return "";
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (modifier === "PM" && hours !== "12") hours = String(+hours + 12);
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.padStart(2, "0")}:${minutes}`;
};

const convertTo12Hour = (time24h) => {
  if (!time24h) return "";
  let [hours, minutes] = time24h.split(":");
  const modifier = +hours >= 12 ? "PM" : "AM";
  hours = (+hours % 12 || 12).toString().padStart(2, "0");
  return `${hours}:${minutes} ${modifier}`;
};

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    name: '',
    phoneNumber: '',
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
    minAmount: '',
    type: 'appointment',
    userId: '',
    groupSize: '',
    appointment: [
      { day: 'MON', startTime: '', endTime: '', duration: '', individualCount: '', groupCount: '' },
      { day: 'TUE', startTime: '', endTime: '', duration: '', individualCount: '', groupCount: '' },
      { day: 'WED', startTime: '', endTime: '', duration: '', individualCount: '', groupCount: '' },
      { day: 'THU', startTime: '', endTime: '', duration: '', individualCount: '', groupCount: '' },
      { day: 'FRI', startTime: '', endTime: '', duration: '', individualCount: '', groupCount: '' },
      { day: 'SAT', startTime: '', endTime: '', duration: '', individualCount: '', groupCount: '' },
      { day: 'SUN', startTime: '', endTime: '', duration: '', individualCount: '', groupCount: '' },
    ],
    token: [
      { day: 'MON', startTokenNo: '', endTokenNo: '' },
      { day: 'TUE', startTokenNo: '', endTokenNo: '' },
      { day: 'WED', startTokenNo: '', endTokenNo: '' },
      { day: 'THU', startTokenNo: '', endTokenNo: '' },
      { day: 'FRI', startTokenNo: '', endTokenNo: '' },
      { day: 'SAT', startTokenNo: '', endTokenNo: '' },
      { day: 'SUN', startTokenNo: '', endTokenNo: '' },
    ],
    reviews: [{ name: '', userId: '', rating: '', comment: '' }],
  });

  const [countries, setCountries] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [selectedCode, setSelectedCode] = useState('+91');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    axios.get('https://restcountries.com/v3.1/all')
      .then(res => {
        const codes = res.data.map(country => ({
          name: country.name.common,
          code: country.idd?.root ? country.idd.root + (country.idd.suffixes?.[0] || '') : '',
        })).filter(c => c.code);
        setCountryCodes(codes.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(err => {
        console.error('Error fetching country codes:', err);
      });

    setCountries(Country.getAllCountries());
  }, []);

  const handleCancel = () => {
    navigate("/");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('https://api.confirmslot.com/Categories/');
        const filtered = res.data.data.filter(cat => !cat.isDeleted);
        setCategories(filtered);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.country) {
      const newStates = State.getStatesOfCountry(formData.country);
      setStates(newStates);
      if (!newStates.some(s => s.isoCode === formData.state)) {
        setFormData(prev => ({ ...prev, state: '', city: '' }));
        setCities([]);
      }
    } else {
      setStates([]);
      setCities([]);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.state) {
      const newCities = City.getCitiesOfState(formData.country, formData.state);
      setCities(newCities);
      if (!newCities.some(c => c.name === formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.country, formData.state]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === 'category') {
      const selectedCategory = categories.find((c) => String(c._id) === String(value));
      const validSubs = selectedCategory?.subcategories?.filter((sc) => !sc.isDeleted) || [];
      setSubcategoriesList(validSubs);
      setFormData((prev) => ({ ...prev, category: value, subcategory: '' }));
    } else if (files) {
      try {
        const type = name === 'logo' ? 'logo' : 'icon';
        const formData = new FormData();
        formData.append('image', files[0]);
        const response = await axios.post(`https://api.confirmslot.com/uploads/${type}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const { imageUrl } = response.data;
        setFormData((prev) => ({ ...prev, [name]: imageUrl }));
        console.log(`Uploaded ${name} URL:`, imageUrl);
      } catch (error) {
        console.error(`Failed to upload ${name}:`, error);
        alert(`Failed to upload ${name}: ${error.response?.data?.message || error.message}`);
      }
    } else if (name === 'phoneNumber') {
      setPhone(value);
      setFormData((prev) => ({ ...prev, phoneNumber: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await res.json();
            if (data && data.address) {
              const countryCode = data.address.country_code?.toUpperCase() || '';
              const country = countries.find(c => c.isoCode === countryCode);
              const isoCode = data.address['ISO3166-2-lvl4'] || '';
              const stateCode = isoCode.split('-')[1] || '';
              const states = State.getStatesOfCountry(countryCode);
              const state = states.find(s => s.isoCode === stateCode) || states[0] || { isoCode: '', name: '' };
              const cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || '';
              const cities = City.getCitiesOfState(countryCode, state?.isoCode || '');
              const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase()) ? cityName : (cities[0]?.name || '');
              setFormData(prev => ({
                ...prev,
                latitude: latitude.toFixed(6),
                longitude: longitude.toFixed(6),
                addressLine1: data.display_name || '',
                country: country ? country.isoCode : '',
                state: state.isoCode,
                city,
                pincode: data.address.postcode || '',
              }));
              setStates(states);
              setCities(cities);
            } else {
              console.error("No address data returned from reverse geocoding");
              alert("Unable to fetch address details. Please enter manually.");
              setFormData(prev => ({
                ...prev,
                latitude: latitude.toFixed(6),
                longitude: longitude.toFixed(6),
              }));
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            alert("Failed to fetch address details. Please enter manually.");
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
            }));
          }
        },
        (err) => {
          console.error("Error getting location:", err.message);
          alert("Failed to get location: " + err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleAppointmentChange = (index, field, value) => {
    const updated = [...formData.appointment];
    updated[index][field] = value;
    setFormData({ ...formData, appointment: updated });
  };

  const handleTokenChange = (index, field, value) => {
    const updatedTokens = [...formData.token];
    updatedTokens[index][field] = value;
    setFormData({ ...formData, token: updatedTokens });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare login payload
    const loginPayload = {
      mobile: `${selectedCode}${phone}`,
    };

    try {
      // Call login API
      const loginResponse = await axios.post(
        "https://api.confirmslot.com/login",
        loginPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (loginResponse.status === 201) {
        const accessToken = loginResponse.data.accessToken;

        const payload = {
          ...formData,
          phoneNumber: `${selectedCode} ${phone}`,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
          appointment: formData.appointment.map((item) => ({
            day: item.day,
            startTime: convertTo12Hour(item.startTime),
            endTime: convertTo12Hour(item.endTime),
            duration: parseInt(item.duration) || 0,
            individualCount: parseInt(item.individualCount) || 0,
            groupCount: parseInt(item.groupCount) || 0,
          })),
          reviews: formData.reviews.map((r) => ({
            ...r,
            rating: parseFloat(r.rating) || 0,
          })),
        };

        const serviceProviderResponse = await axios.post(
          "https://api.confirmslot.com/service-provider",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (serviceProviderResponse.status === 200) {
          alert("Form submitted successfully!");
        } else {
          alert("Submission failed");
        }
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error("Error during submission:", err);
      alert("Error while submitting form: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Category</h3>
        <div className="form-group">
          <select name="category" onChange={handleChange} value={formData.category}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <select
            name="subcategory"
            onChange={handleChange}
            value={formData.subcategory}
            disabled={!formData.category}
          >
            <option value="">Select Subcategory</option>
            {subcategoriesList.map((sc) => (
              <option key={sc._id} value={sc._id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Basic Info</h3>
        <div className="form-group">
          <input name="name" placeholder="Name" onChange={handleChange} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            style={{
              height: '40px',
              padding: '0 12px',
              fontSize: '16px',
              lineHeight: '1.5',
              borderRadius: '4px',
              border: '1px solid #ccc',
              minWidth: '200px',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Select Country Code</option>
            {countryCodes.map((country, idx) => (
              <option key={idx} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>

          <div style={{ flexGrow: 1 }}>
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              value={phone}
              onChange={handleChange}
              style={{
                height: '40px',
                width: '100%',
                padding: '0 12px',
                fontSize: '16px',
                lineHeight: '1.5',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="logo">Logo Upload</label>
          <input type="file" name="logo" accept="image/*" onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="icon">Icon Upload</label>
          <input type="file" name="icon" accept="image/*" onChange={handleChange} />
        </div>
      </div>

      <div className="form-section">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Location Details</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={getLocation} 
            startIcon={<span>📍</span>}
          >
            Locate Me
          </Button>
        </Box>
        <div className="form-group">
          <input name="latitude" value={formData.latitude} placeholder="Latitude" onChange={handleChange} />
        </div>
        <div className="form-group">
          <input name="longitude" value={formData.longitude} placeholder="Longitude" onChange={handleChange} />
        </div>
        <div className="form-group">
          <input name="addressLine1" value={formData.addressLine1} placeholder="Address Line 1" onChange={handleChange} />
        </div>
        <div className="form-group">
          <input name="addressLine2" value={formData.addressLine2} placeholder="Address Line 2" onChange={handleChange} />
        </div>
        <div className="form-group">
          <select name="country" onChange={handleChange} value={formData.country}>
            <option value="">Select Country</option>
            {countries.map(c => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <select name="state" onChange={handleChange} value={formData.state} disabled={!states.length}>
            <option value="">Select State</option>
            {states.map(s => (
              <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <select name="city" onChange={handleChange} value={formData.city} disabled={!cities.length}>
            <option value="">Select District</option>
            {cities.map((c, i) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <input name="pincode" value={formData.pincode} placeholder="Pincode" onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <select name="type" onChange={handleChange} value={formData.type}>
          <option value="appointment">Appointment</option>
          <option value="token">Token</option>
        </select>
      </div>
      <div className="form-group">
        <input name="minAmount" placeholder="Minimum Amount" value={formData.minAmount} onChange={handleChange} />
      </div>

      {(formData.type === 'appointment' || formData.type === 'both') && (
        <>
          <h4>Appointments</h4>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {formData.appointment.map((item, index) => (
              <div key={index} className="appointment-row" style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '1rem' }}>{item.day}</label>
                <TimePicker
                  label="Start Time"
                  value={item.startTime ? dayjs(`2024-01-01T${convertTo24Hour(item.startTime)}`) : null}
                  onChange={(newValue) => {
                    handleAppointmentChange(index, 'startTime', newValue ? newValue.format('hh:mm A') : '');
                  }}
                  ampm
                />
                <TimePicker
                  label="End Time"
                  value={item.endTime ? dayjs(`2024-01-01T${convertTo24Hour(item.endTime)}`) : null}
                  onChange={(newValue) => {
                    handleAppointmentChange(index, 'endTime', newValue ? newValue.format('hh:mm A') : '');
                  }}
                  ampm
                />
                <div className="form-group">
                  <input
                    name={`duration-${index}`}
                    placeholder="Duration (min)"
                    value={item.duration}
                    onChange={(e) => handleAppointmentChange(index, 'duration', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    name={`individualCount-${index}`}
                    placeholder="Individual Count"
                    value={item.individualCount}
                    onChange={(e) => handleAppointmentChange(index, 'individualCount', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    name={`groupCount-${index}`}
                    placeholder="Group Count"
                    value={item.groupCount}
                    onChange={(e) => handleAppointmentChange(index, 'groupCount', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </LocalizationProvider>
        </>
      )}

      {formData.type === 'token' && (
        <>
          <h4>Token Numbers (Per Day)</h4>
          {formData.token.map((item, index) => (
            <div key={index} className="token-row">
              <label>{item.day}</label>
              <input
                type="number"
                min="0"
                placeholder="Start Token No"
                value={item.startTokenNo}
                onChange={(e) =>
                  handleTokenChange(index, 'startTokenNo', Math.max(0, parseInt(e.target.value) || 0))
                }
              />
              <input
                type="number"
                min="0"
                placeholder="End Token No"
                value={item.endTokenNo}
                onChange={(e) =>
                  handleTokenChange(index, 'endTokenNo', Math.max(0, parseInt(e.target.value) || 0))
                }
              />
            </div>
          ))}
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="form-button">Submit</button>
        <button type="button" className="form-button" onClick={handleCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default RegisterForm;