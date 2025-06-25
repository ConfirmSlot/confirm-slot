import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Box, Typography, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, IconButton, Collapse } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import './Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const convertTo24Hour = (time12h) => {
  if (!time12h) return "";
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (modifier === "PM" && hours !== "12") hours = String(+hours + 12);
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.padStart(2, "0")}:${minutes}`;
};

const dayMapping = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
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
      { day: 'MON', availableFrom: '09:00 AM', availableTo: '05:00 PM', slotDurationMins: '15', breaks: [], showBreaks: false },
      { day: 'TUE', availableFrom: '09:00 AM', availableTo: '05:00 PM', slotDurationMins: '15', breaks: [], showBreaks: false },
      { day: 'WED', availableFrom: '09:00 AM', availableTo: '05:00 PM', slotDurationMins: '15', breaks: [], showBreaks: false },
      { day: 'THU', availableFrom: '09:00 AM', availableTo: '05:00 PM', slotDurationMins: '15', breaks: [], showBreaks: false },
      { day: 'FRI', availableFrom: '09:00 AM', availableTo: '05:00 PM', slotDurationMins: '15', breaks: [], showBreaks: false },
      { day: 'SAT', availableFrom: '09:00 AM', availableTo: '05:00 PM', slotDurationMins: '15', breaks: [], showBreaks: false },
      { day: 'SUN', availableFrom: '09:00 AM', availableTo: '05:00 PM', slotDurationMins: '15', breaks: [], showBreaks: false },
    ],
    token: [
      { 
        day: 'MON', 
        morning: { startTime: '08:00 AM', endTime: '12:00 PM', startTokenNo: 1, endTokenNo: 1 },
        afternoon: { startTime: '01:00 PM', endTime: '05:00 PM', startTokenNo: 1, endTokenNo: 1 }
      },
      { 
        day: 'TUE', 
        morning: { startTime: '08:00 AM', endTime: '12:00 PM', startTokenNo: 1, endTokenNo: 1 },
        afternoon: { startTime: '01:00 PM', endTime: '05:00 PM', startTokenNo: 1, endTokenNo: 1 }
      },
      { 
        day: 'WED', 
        morning: { startTime: '08:00 AM', endTime: '12:00 PM', startTokenNo: 1, endTokenNo: 1 },
        afternoon: { startTime: '01:00 PM', endTime: '05:00 PM', startTokenNo: 1, endTokenNo: 1 }
      },
      { 
        day: 'THU', 
        morning: { startTime: '08:00 AM', endTime: '12:00 PM', startTokenNo: 1, endTokenNo: 1 },
        afternoon: { startTime: '01:00 PM', endTime: '05:00 PM', startTokenNo: 1, endTokenNo: 1 }
      },
      { 
        day: 'FRI', 
        morning: { startTime: '08:00 AM', endTime: '12:00 PM', startTokenNo: 1, endTokenNo: 1 },
        afternoon: { startTime: '01:00 PM', endTime: '05:00 PM', startTokenNo: 1, endTokenNo: 1 }
      },
      { 
        day: 'SAT', 
        morning: { startTime: '08:00 AM', endTime: '12:00 PM', startTokenNo: 1, endTokenNo: 1 },
        afternoon: { startTime: '01:00 PM', endTime: '05:00 PM', startTokenNo: 1, endTokenNo: 1 }
      },
      { 
        day: 'SUN', 
        morning: { startTime: '08:00 AM', endTime: '12:00 PM', startTokenNo: 1, endTokenNo: 1 },
        afternoon: { startTime: '01:00 PM', endTime: '05:00 PM', startTokenNo: 1, endTokenNo: 1 }
      },
    ],
  });

  const [countries, setCountries] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState('91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
    const codes = allCountries
      .map(country => ({
        name: country.name,
        code: country.phonecode,
        isoCode: country.isoCode,
      }))
      .filter(c => c.code)
      .sort((a, b) => a.name.localeCompare(b.name));
    setCountryCodes(codes);
  }, []);

  const handleCancel = () => {
    navigate("/");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/Categories/`);
        const filtered = res.data.data.filter(cat => !cat.isDeleted);
        setCategories(filtered);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to fetch categories. Please try again.');
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
     // eslint-disable-next-line
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
     // eslint-disable-next-line
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
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/Uploads/${type}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const { imageUrl } = response.data;
        setFormData((prev) => ({ ...prev, [name]: imageUrl }));
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
      } catch (error) {
        console.error(`Failed to upload ${name}:`, error);
        toast.error(`Failed to upload ${name}: ${error.response?.data?.message || error.message}`);
      }
    } else if (name === 'phoneNumber') {
      setPhone(value);
      setFormData((prev) => ({ ...prev, phoneNumber: value }));
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtp('');
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !selectedCode) {
      toast.error('Please enter a valid phone number and select a country code.');
      return;
    }
    setIsLoading(true);
    const payload = {
      route: 'otp',
      variables_values: '0000',
      schedule_time: 0,
      numbers: `${phone}`,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/otp/send`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200 || response.status === 201) {
        setIsOtpSent(true);
        toast.success('OTP sent successfully!');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(`Failed to send OTP: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    const payload = {
      phoneNumber: `${phone}`,
      otp: otp
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/otp/validate`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200 || response.status === 201) {
        setIsOtpVerified(true);
        toast.success('OTP verified successfully!');
      } else {
        toast.error('OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(`OTP verification failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
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
              toast.success('Location fetched successfully!');
            } else {
              console.error("No address data returned from reverse geocoding");
              toast.warn('Unable to fetch address details. Please enter manually.');
              setFormData(prev => ({
                ...prev,
                latitude: latitude.toFixed(6),
                longitude: longitude.toFixed(6),
              }));
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            toast.error('Failed to fetch address details: ' + error.message);
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
            }));
          }
        },
        (err) => {
          console.error("Error getting location:", err.message);
          toast.error('Failed to get location: ' + err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleAppointmentChange = (index, field, value) => {
    const updated = [...formData.appointment];
    updated[index][field] = value;
    setFormData({ ...formData, appointment: updated });
  };

  const handleBreakChange = (appIndex, breakIndex, field, value) => {
    const updated = [...formData.appointment];
    updated[appIndex].breaks[breakIndex][field] = value;
    setFormData({ ...formData, appointment: updated });
  };

  const toggleBreaks = (index) => {
    const updated = [...formData.appointment];
    if (!updated[index].showBreaks && updated[index].breaks.length === 0) {
      updated[index].breaks.push({ startTime: '01:00 PM', endTime: '02:00 PM' });
    }
    updated[index].showBreaks = !updated[index].showBreaks;
    setFormData({ ...formData, appointment: updated });
  };

  const addBreak = (index) => {
    const updated = [...formData.appointment];
    updated[index].breaks.push({ startTime: '01:00 PM', endTime: '02:00 PM' });
    setFormData({ ...formData, appointment: updated });
  };

  const handleTokenChange = (index, session, field, value) => {
    const updatedTokens = [...formData.token];
    updatedTokens[index][session][field] = value;
    setFormData({ ...formData, token: updatedTokens });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isOtpVerified) {
      toast.error('Please verify your phone number before submitting.');
      return;
    }
    setOpenConfirm(true);
  };

  // const handleConfirmSubmit = async () => {
  //   setOpenConfirm(false);
  //   setIsLoading(true);

  //   const loginPayload = {
  //     mobile: `${selectedCode}${phone}`,
  //   };

  //   try {
  //     const loginResponse = await axios.post(
  //       `${process.env.REACT_APP_API_URL}/login`,
  //       loginPayload,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     if (loginResponse.status === 201) {
  //       const accessToken = loginResponse.data.accessToken;
  //       const userId = loginResponse.data.user.id;

  //       const country = countries.find(c => c.isoCode === formData.country);
  //       const state = states.find(s => s.isoCode === formData.state);

  //       const payload = {
  //         ...formData,
  //         userId: userId,
  //         phoneNumber: `${selectedCode} ${phone}`,
  //         country: country ? country.name : formData.country,
  //         state: state ? state.name : formData.state,
  //         latitude: parseFloat(formData.latitude) || 0,
  //         longitude: parseFloat(formData.longitude) || 0,
  //         appointment: formData.appointment.map((item) => ({
  //           day: dayMapping[item.day],
  //           availableFrom: item.availableFrom || '09:00 AM',
  //           availableTo: item.availableTo || '05:00 PM',
  //           slotDurationMins: parseInt(item.slotDurationMins) || 15,
  //           breaks: item.breaks.map((b) => ({
  //             startTime: b.startTime || '01:00 PM',
  //             endTime: b.endTime || '02:00 PM',
  //           })),
  //         })),
  //         token: formData.token.map((item) => ({
  //           day: dayMapping[item.day],
  //           morning: {
  //             startTime: item.morning.startTime || '08:00 AM',
  //             endTime: item.morning.endTime || '12:00 PM',
  //             startTokenNo: parseInt(item.morning.startTokenNo) || 0,
  //             endTokenNo: parseInt(item.morning.endTokenNo) || 0,
  //           },
  //           afternoon: {
  //             startTime: item.afternoon.startTime || '01:00 PM',
  //             endTime: item.afternoon.endTime || '05:00 PM',
  //             startTokenNo: parseInt(item.afternoon.startTokenNo) || 0,
  //             endTokenNo: parseInt(item.afternoon.endTokenNo) || 0,
  //           },
  //         })),
  //       };

  //       const serviceProviderResponse = await axios.post(
  //         `${process.env.REACT_APP_API_URL}/service-provider`,
  //         payload,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       if (serviceProviderResponse.status === 201) {
  //         toast.success('Form submitted successfully!');
  //       } else {
  //         toast.error('Submission failed. Please try again.');
  //       }
  //     } else {
  //       toast.error('Login failed. Please check your credentials.');
  //     }
  //   } catch (err) {
  //     console.error('Error during submission:', err);
  //     toast.error(`Error while submitting form: ${err.response?.data?.message || err.message}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleConfirmSubmit = async () => {
  setOpenConfirm(false);
  setIsLoading(true);

  const loginPayload = {
    mobile: `${selectedCode}${phone}`,
  };

  try {
    const loginResponse = await axios.post(
      `${process.env.REACT_APP_API_URL}/login`,
      loginPayload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (loginResponse.status === 201) {
      const accessToken = loginResponse.data.accessToken;
      const userId = loginResponse.data.user.id;

      const country = countries.find(c => c.isoCode === formData.country);
      const state = states.find(s => s.isoCode === formData.state);

      const payload = {
        ...formData,
        userId: userId,
        phoneNumber: `${selectedCode} ${phone}`,
        country: country ? country.name : formData.country,
        state: state ? state.name : formData.state,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        dailySlotConfig: formData.appointment.map((item, index) => ({
          day: dayMapping[item.day],
          appointmentSessions: formData.type === 'appointment' || formData.type === 'both' ? [{
            slotDuration: parseInt(item.slotDurationMins) || 15,
            allowedPersons: 5, // Hardcoded as per requirement
            groupsAllowed: 1, // Hardcoded as per requirement
            groupSize: parseInt(formData.groupSize) || 5, // Use formData.groupSize or default to 5
            bookingOpenTime: convertTo24Hour(item.availableFrom || '09:00 AM') + ':00',
            breakTimes: item.breaks.map((b) => ({
              startTime: convertTo24Hour(b.startTime || '01:00 PM'),
              endTime: convertTo24Hour(b.endTime || '02:00 PM'),
            })),
          }] : [],
          tokenSessions: formData.type === 'token' || formData.type === 'both' ? [
            {
              startTime: convertTo24Hour(formData.token[index].morning.startTime || '08:00 AM'),
              endTime: convertTo24Hour(formData.token[index].morning.endTime || '12:00 PM'),
              startTokenNo: parseInt(formData.token[index].morning.startTokenNo) || 1,
              endTokenNo: parseInt(formData.token[index].morning.endTokenNo) || 1,
              breakTimes: [], // Add break times for token morning session if needed
            },
            {
              startTime: convertTo24Hour(formData.token[index].afternoon.startTime || '01:00 PM'),
              endTime: convertTo24Hour(formData.token[index].afternoon.endTime || '05:00 PM'),
              startTokenNo: parseInt(formData.token[index].afternoon.startTokenNo) || 1,
              endTokenNo: parseInt(formData.token[index].afternoon.endTokenNo) || 1,
              breakTimes: [], // Add break times for token afternoon session if needed
            },
          ] : [],
          tokenOpenTime: convertTo24Hour(formData.token[index].morning.startTime || '08:00 AM') + ':00',
        })),
      };

      const serviceProviderResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/service-providers`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (serviceProviderResponse.status === 201) {
        toast.success('Form submitted successfully!');
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } else {
      toast.error('Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Error during submission:', err);
    toast.error(`Error while submitting form: ${err.response?.data?.message || err.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

const deleteBreak = (appointmentIndex, breakIndex) => {
  const updatedAppointments = [...formData.appointment];
  updatedAppointments[appointmentIndex].breaks.splice(breakIndex, 1);
  setFormData({
    ...formData,
    appointment: updatedAppointments,
  });
};



  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'all',
          }}
        >
          <CircularProgress size={60} color="primary" />
        </Box>
      )}
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Category</h3>
          <div className="form-group">
            <select name="category" onChange={handleChange} value={formData.category} disabled={isLoading}>
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
              disabled={!formData.category || isLoading}
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
            <input name="name" placeholder="Name" onChange={handleChange} disabled={isLoading} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              disabled={isLoading || isOtpVerified}
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

            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                value={phone}
                onChange={handleChange}
                disabled={isLoading || isOtpSent || isOtpVerified}
                style={{
                  height: '40px',
                  width: '50%',
                  padding: '0 12px',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              />
              {!isOtpSent && !isOtpVerified && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendOtp}
                  disabled={isLoading || !phone || !selectedCode}
                  sx={{ height: '40px' }}
                >
                  Verify
                </Button>
              )}
              {isOtpSent && !isOtpVerified && (
                <>
                  <TextField
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                    sx={{ width: '120px', height: '40px' }}
                    inputProps={{
                      style: {
                        height: '40px',
                        padding: '0 12px',
                        fontSize: '16px',
                        lineHeight: '1.5',
                        boxSizing: 'border-box',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || !otp || otp.length !== 6}
                    sx={{ height: '40px' }}
                  >
                    Submit
                  </Button>
                </>
              )}
              {isOtpVerified && (
                <IconButton sx={{ color: 'green' }}>
                  <CheckCircleIcon />
                </IconButton>
              )}
            </div>
          </div>
          <div className="form-group">
            <input
              type="number"
              name="minAmount"
              placeholder="Minimum Amount"
              value={formData.minAmount}
              onChange={handleChange}
              min="0"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="logo">Logo Upload</label>
            <input type="file" name="logo" accept="image/*" onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="icon">Icon Upload</label>
            <input type="file" name="icon" accept="image/*" onChange={handleChange} disabled={isLoading} />
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
              disabled={isLoading}
            >
              Locate Me
            </Button>
          </Box>
          <div className="form-group">
            <input name="latitude" value={formData.latitude} placeholder="Latitude" onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="form-group">
            <input name="longitude" value={formData.longitude} placeholder="Longitude" onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="form-group">
            <input name="addressLine1" value={formData.addressLine1} placeholder="Address Line 1" onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="form-group">
            <input name="addressLine2" value={formData.addressLine2} placeholder="Address Line 2" onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="form-group">
            <select name="country" onChange={handleChange} value={formData.country} disabled={isLoading}>
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="state" onChange={handleChange} value={formData.state} disabled={!states.length || isLoading}>
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select name="city" onChange={handleChange} value={formData.city} disabled={!cities.length || isLoading}>
              <option value="">Select District</option>
              {cities.map((c, i) => (
                <option key={i} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <input name="pincode" value={formData.pincode} placeholder="Pincode" onChange={handleChange} disabled={isLoading} />
          </div>
        </div>

        <div className="form-group">
          <select name="type" onChange={handleChange} value={formData.type} disabled={isLoading}>
            <option value="appointment">Appointment</option>
            <option value="token">Token</option>
          </select>
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* {(formData.type === 'appointment' || formData.type === 'both') && (
            <>
              <h4>Appointments</h4>
              {formData.appointment.map((item, index) => (
                <div key={index} className="appointment-row" style={{ marginBottom: '1rem', border: '1px solid #e0e0e0', padding: '10px', borderRadius: '4px' }}>
                  <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <Typography variant="body1" sx={{ minWidth: '60px' }}>{item.day}</Typography>
                    <TimePicker
                      label="Available From"
                      value={item.availableFrom ? dayjs(`2024-01-01T${convertTo24Hour(item.availableFrom)}`) : null}
                      onChange={(newValue) => {
                        handleAppointmentChange(index, 'availableFrom', newValue ? newValue.format('hh:mm A') : '09:00 AM');
                      }}
                      ampm
                      disabled={isLoading}
                      sx={{ width: '150px' }}
                    />
                    <TimePicker
                      label="Available To"
                      value={item.availableTo ? dayjs(`2024-01-01T${convertTo24Hour(item.availableTo)}`) : null}
                      onChange={(newValue) => {
                        handleAppointmentChange(index, 'availableTo', newValue ? newValue.format('hh:mm A') : '05:00 PM');
                      }}
                      ampm
                      disabled={isLoading}
                      sx={{ width: '150px' }}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        type="number"
                        label="Slot Duration (min)"
                        value={item.slotDurationMins}
                        onChange={(e) => handleAppointmentChange(index, 'slotDurationMins', e.target.value)}
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{ width: '150px' }}
                        disabled={isLoading}
                      />
                      <IconButton onClick={() => toggleBreaks(index)} disabled={isLoading}>
                        <AddCircleIcon color={item.showBreaks ? 'secondary' : 'primary'} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Collapse in={item.showBreaks}>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                      <Typography variant="subtitle2">Breaks</Typography>
                      {item.breaks.map((breakItem, breakIndex) => (
                        <Box key={breakIndex} display="flex" gap={2} mt={1} flexWrap="wrap">
                          <TimePicker
                            label="Break Start"
                            value={breakItem.startTime ? dayjs(`2024-01-01T${convertTo24Hour(breakItem.startTime)}`) : null}
                            onChange={(newValue) => {
                              handleBreakChange(index, breakIndex, 'startTime', newValue ? newValue.format('hh:mm A') : '01:00 PM');
                            }}
                            ampm
                            disabled={isLoading}
                            sx={{ width: '150px' }}
                          />
                          <TimePicker
                            label="Break End"
                            value={breakItem.endTime ? dayjs(`2024-01-01T${convertTo24Hour(breakItem.endTime)}`) : null}
                            onChange={(newValue) => {
                              handleBreakChange(index, breakIndex, 'endTime', newValue ? newValue.format('hh:mm A') : '02:00 PM');
                            }}
                            ampm
                            disabled={isLoading}
                            sx={{ width: '150px' }}
                          />
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => addBreak(index)}
                        disabled={isLoading}
                        sx={{ mt: 2 }}
                      >
                        Add Break
                      </Button>
                    </Box>
                  </Collapse>
                </div>
              ))}
            </>
          )} */}

{(formData.type === 'appointment' || formData.type === 'both') && (
  <>
    <h4>Appointments</h4>
    {formData.appointment.map((item, index) => (
      <div
        key={index}
        className="appointment-row"
        style={{
          marginBottom: '1rem',
          border: '1px solid #e0e0e0',
          padding: '10px',
          borderRadius: '4px',
          display: 'block',
        }}
      >
        <Typography variant="body1" sx={{ minWidth: '60px', marginBottom: '10px' }}>
          {item.day}
        </Typography>
        <Box className="appointment-main-row" display="flex" alignItems="center" gap={2}>
          <TimePicker
            label="Start Time"
            value={item.availableFrom ? dayjs(`2024-01-01T${convertTo24Hour(item.availableFrom)}`) : null}
            onChange={(newValue) => {
              handleAppointmentChange(index, 'availableFrom', newValue ? newValue.format('hh:mm A') : '09:00 AM');
            }}
            ampm
            disabled={isLoading}
            sx={{ width: '150px' }}
          />
          <TimePicker
            label="End Time"
            value={item.availableTo ? dayjs(`2024-01-01T${convertTo24Hour(item.availableTo)}`) : null}
            onChange={(newValue) => {
              handleAppointmentChange(index, 'availableTo', newValue ? newValue.format('hh:mm A') : '05:00 PM');
            }}
            ampm
            disabled={isLoading}
            sx={{ width: '150px' }}
          />
          <Box display="flex" alignItems="center" gap={1} className="slot-duration-container">
            <TextField
              type="number"
              label="Duration (min)"
              value={item.slotDurationMins}
              onChange={(e) => handleAppointmentChange(index, 'slotDurationMins', e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ width: '150px' }}
              disabled={isLoading}
            />
            <IconButton onClick={() => toggleBreaks(index)} disabled={isLoading}>
              <AddCircleIcon color={item.showBreaks ? 'secondary' : 'primary'} />
            </IconButton>
          </Box>
        </Box>
        <Collapse in={item.showBreaks}>
          <Box className="breaks-container" mt={1}>
            <Typography variant="subtitle2">Breaks</Typography>
            {item.breaks.map((breakItem, breakIndex) => (
              <Box
                key={breakIndex}
                className="break-row"
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 1,
                  marginBottom: '0.5rem',
                }}
              >
                <TimePicker
                  label="Break Start"
                  value={
                    breakItem.startTime
                      ? dayjs(`2024-01-01T${convertTo24Hour(breakItem.startTime)}`)
                      : null
                  }
                  onChange={(newValue) => {
                    handleBreakChange(index, breakIndex, 'startTime', newValue ? newValue.format('hh:mm A') : '01:00 PM');
                  }}
                  ampm
                  disabled={isLoading}
                  sx={{ width: { xs: '100%', sm: '150px' } }}
                />
                <TimePicker
                  label="Break End"
                  value={
                    breakItem.endTime
                      ? dayjs(`2024-01-01T${convertTo24Hour(breakItem.endTime)}`)
                      : null
                  }
                  onChange={(newValue) => {
                    handleBreakChange(index, breakIndex, 'endTime', newValue ? newValue.format('hh:mm A') : '02:00 PM');
                  }}
                  ampm
                  disabled={isLoading}
                  sx={{ width: { xs: '100%', sm: '150px' } }}
                />
                <IconButton
                  onClick={() => deleteBreak(index, breakIndex)}
                  disabled={isLoading}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={() => addBreak(index)}
              disabled={isLoading}
              className="add-break-btn"
              style={{ marginTop: '10px' }}
            >
              Add Break
            </Button>
          </Box>
        </Collapse>
      </div>
    ))}
  </>
)}
         {formData.type === 'token' && (
  <>
    <h4 style={{ marginBottom: '16px', fontSize: '1.25rem', fontWeight: 500 }}>Token Sessions</h4>
    {formData.token.map((item, index) => (
      <div
        key={index}
        className="token-row"
        style={{
          marginBottom: '24px',
          border: '1px solid #e0e0e0',
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600, color: '#333' }}
        >
          {item.day}
        </Typography>
        <Box
          sx={{
            mb: 3,
            p: 3,
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontSize: '1rem', fontWeight: 500, color: '#555' }}
          >
            Morning Session
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TimePicker
              label="Start Time"
              value={
                item.morning.startTime
                  ? dayjs(`2024-01-01T${convertTo24Hour(item.morning.startTime)}`)
                  : null
              }
              onChange={(newValue) => {
                handleTokenChange(
                  index,
                  'morning',
                  'startTime',
                  newValue ? newValue.format('hh:mm A') : '08:00 AM'
                );
              }}
              ampm
              disabled={isLoading}
              sx={{
                width: '160px',
                '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
              }}
            />
            <TimePicker
              label="End Time"
              value={
                item.morning.endTime
                  ? dayjs(`2024-01-01T${convertTo24Hour(item.morning.endTime)}`)
                  : null
              }
              onChange={(newValue) => {
                handleTokenChange(
                  index,
                  'morning',
                  'endTime',
                  newValue ? newValue.format('hh:mm A') : '12:00 PM'
                );
              }}
              ampm
              disabled={isLoading}
              sx={{
                width: '160px',
                '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
              }}
            />
    <TextField
  label="Start Token"
  type="number"
  placeholder="Enter start token"
  value={item.morning.startTokenNo || ''}
  onChange={(e) =>
    handleTokenChange(
      index,
      'morning',
      'startTokenNo',
      Math.max(0, parseInt(e.target.value) || 0).toString()
    )
  }
  disabled={isLoading}
  sx={{
    width: '160px',
    '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
  }}
/>

<TextField
  label="End Token"
  type="number"
  placeholder="Enter end token"
  value={item.morning.endTokenNo || ''}
  onChange={(e) =>
    handleTokenChange(
      index,
      'morning',
      'endTokenNo',
      Math.max(0, parseInt(e.target.value) || 0).toString()
    )
  }
  disabled={isLoading}
  sx={{
    width: '160px',
    '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
  }}
/>
          </Box>
        </Box>
        <Box
          sx={{
            p: 3,
            mb:3,
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontSize: '1rem', fontWeight: 500, color: '#555' }}
          >
            Afternoon Session
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TimePicker
              label="Start Time"
              value={
                item.afternoon.startTime
                  ? dayjs(`2024-01-01T${convertTo24Hour(item.afternoon.startTime)}`)
                  : null
              }
              onChange={(newValue) => {
                handleTokenChange(
                  index,
                  'afternoon',
                  'startTime',
                  newValue ? newValue.format('hh:mm A') : '01:00 PM'
                );
              }}
              ampm
              disabled={isLoading}
              sx={{
                width: '160px',
                '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
              }}
            />
            <TimePicker
              label="End Time"
              value={
                item.afternoon.endTime
                  ? dayjs(`2024-01-01T${convertTo24Hour(item.afternoon.endTime)}`)
                  : null
              }
              onChange={(newValue) => {
                handleTokenChange(
                  index,
                  'afternoon',
                  'endTime',
                  newValue ? newValue.format('hh:mm A') : '05:00 PM'
                );
              }}
              ampm
              disabled={isLoading}
              sx={{
                width: '160px',
                '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
              }}
            />
         <TextField
  label="Start Token No"
  type="number"
  placeholder="Enter start token"
  value={item.afternoon.startTokenNo || ''}
  onChange={(e) =>
    handleTokenChange(
      index,
      'afternoon',
      'startTokenNo',
      Math.max(0, parseInt(e.target.value) || 0).toString()
    )
  }
  disabled={isLoading}
  sx={{
    width: '160px',
    '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
  }}
/>

<TextField
  label="End Token No"
  type="number"
  placeholder="Enter end token"
  value={item.afternoon.endTokenNo || ''}
  onChange={(e) =>
    handleTokenChange(
      index,
      'afternoon',
      'endTokenNo',
      Math.max(0, parseInt(e.target.value) || 0).toString()
    )
  }
  disabled={isLoading}
  sx={{
    width: '160px',
    '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fff' },
  }}
/>
          </Box>
        </Box>
      </div>
    ))}
  </>
)}
        </LocalizationProvider>

        <div className="form-actions">
          <button type="submit" className="form-button" disabled={isLoading || !isOtpVerified}>Submit</button>
          <button type="button" className="form-button" onClick={handleCancel} disabled={isLoading}>Cancel</button>
        </div>
      </form>

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        disableEscapeKeyDown={isLoading}
        sx={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
        <DialogTitle id="confirm-dialog-title">Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to submit the registration form? Please verify all details before proceeding.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="secondary" disabled={isLoading}>
            No
          </Button>
          <Button onClick={handleConfirmSubmit} color="primary" autoFocus disabled={isLoading}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RegisterForm;