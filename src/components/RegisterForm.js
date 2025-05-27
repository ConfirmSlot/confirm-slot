import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const appointmentCategories = [
  {
    category: "Healthcare",
    subcategories: [
      "General Physician",
      "Dentist",
      "Dermatologist",
      "Cardiologist",
      "Gynecologist",
      "Pediatrician",
      "Psychiatrist / Psychologist",
      "Physiotherapist",
      "Eye Specialist (Ophthalmologist)",
      "ENT Specialist",
      "Ayurveda / Homeopathy",
    ],
  },
  {
    category: "Beauty & Wellness",
    subcategories: [
      "Salon Services",
      "Spa & Massage",
      "Makeup Artist",
      "Nail Art / Manicure-Pedicure",
      "Bridal Services",
      "Skincare / Dermatology Clinics",
    ],
  },
  {
    category: "Legal Services",
    subcategories: [
      "Civil Lawyer",
      "Criminal Lawyer",
      "Corporate Lawyer",
      "Property Lawyer",
      "Divorce Lawyer",
      "Legal Consultant",
    ],
  },
  {
    category: "Education & Tutoring",
    subcategories: [
      "School Tutoring",
      "Competitive Exam Coaching",
      "Language Tutors",
      "Music Lessons",
      "Dance Classes",
    ],
  },
  {
    category: "Financial Services",
    subcategories: [
      "Chartered Accountant",
      "Tax Consultant",
      "Investment Advisor",
      "Insurance Agent",
      "Loan Consultant",
    ],
  },
  {
    category: "Government / Public Services",
    subcategories: [
      "Passport Appointment",
      "Aadhar Update Center",
      "RTO Services",
      "Municipality Office Visit",
      "Police Verification",
    ],
  },
  {
    category: "Home Services",
    subcategories: [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Appliance Repair",
      "Pest Control",
      "Cleaning Services",
    ],
  },
  {
    category: "Tech & Business Consulting",
    subcategories: [
      "Software Consultant",
      "Digital Marketing Expert",
      "Web Developer",
      "Startup Mentor",
      "Business Analyst",
    ],
  },
  {
    category: "Automotive Services",
    subcategories: [
      "Car Servicing",
      "Bike Servicing",
      "Vehicle Inspection",
      "Insurance Renewal",
      "Detailing & Washing",
    ],
  },
  {
    category: "Events & Photography",
    subcategories: [
      "Event Planner",
      "Wedding Photographer",
      "Candid Photography",
      "Videography",
      "Pre-wedding Shoot",
    ],
  },
];

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
    category: "",
    subcategory: "",
    name: "",
    logo: "",
    icon: "",
    latitude: "",
    longitude: "",
    addressLine1: "",
    addressLine2: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    type: "both",
    userId: "",
    appointment: [
      { day: "MON", startTime: "", endTime: "" },
      { day: "TUE", startTime: "", endTime: "" },
      { day: "WED", startTime: "", endTime: "" },
      { day: "THU", startTime: "", endTime: "" },
      { day: "FRI", startTime: "", endTime: "" },
      { day: "SAT", startTime: "", endTime: "" },
      { day: "SUN", startTime: "", endTime: "" },
    ],
    token: [
      { day: "MON", startTokenNo: "", endTokenNo: "" },
      { day: "TUE", startTokenNo: "", endTokenNo: "" },
      { day: "WED", startTokenNo: "", endTokenNo: "" },
      { day: "THU", startTokenNo: "", endTokenNo: "" },
      { day: "FRI", startTokenNo: "", endTokenNo: "" },
      { day: "SAT", startTokenNo: "", endTokenNo: "" },
      { day: "SUN", startTokenNo: "", endTokenNo: "" },
    ],

    reviews: [{ name: "", userId: "", rating: "", comment: "" }],
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/");
  };

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.country) {
      const result = State.getStatesOfCountry(formData.country);
      setStates(result);
      setCities([]);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      const result = City.getCitiesOfState(formData.country, formData.state);
      setCities(result);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.state, formData.country]);

  useEffect(() => {
    const selected = appointmentCategories.find(
      (cat) => cat.category === formData.category
    );
    setSubcategoriesList(selected ? selected.subcategories : []);
    setFormData((prev) => ({ ...prev, subcategory: "" }));
  }, [formData.category]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({ ...prev, [name]: value }));
  // };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err.message);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      appointment: formData.appointment.map((item) => ({
        day: item.day,
        startTime: convertTo12Hour(item.startTime),
        endTime: convertTo12Hour(item.endTime),
      })),
      reviews: formData.reviews.map((r) => ({
        ...r,
        rating: parseFloat(r.rating),
      })),
    };

    try {
      const res = await axios.post(
        "https://confirmslot.com/service-provider",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.status === 200) alert("Form submitted successfully!");
      else alert("Submission failed");
    } catch (err) {
      console.error(err);
      alert("Error while submitting form");
    }
  };

  const handleTokenChange = (index, field, value) => {
    const updatedTokens = [...formData.token];
    updatedTokens[index][field] = value;
    setFormData({ ...formData, token: updatedTokens });
  };

  return (
    <>
      <h2 className="form-title">Registration</h2>
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Category</h3>
          <div className="form-group">
            <select
              name="category"
              onChange={handleChange}
              value={formData.category}
            >
              <option value="">Select Category</option>
              {appointmentCategories.map((c, i) => (
                <option key={i} value={c.category}>
                  {c.category}
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
              {subcategoriesList.map((sc, i) => (
                <option key={i} value={sc}>
                  {sc}
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

          {/* <div className="form-group">
    <input name="logo" placeholder="Logo URL" onChange={handleChange} />
  </div>

  <div className="form-group">
    <input name="icon" placeholder="Icon URL" onChange={handleChange} />
  </div> */}

          <div className="form-group">
            <label htmlFor="logo">Logo Upload</label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon Upload</label>
            <input
              type="file"
              name="icon"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              name="googlemap"
              placeholder="google map"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              name="googlelink"
              placeholder="google link"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Location Details</h3>

          <IconButton
            onClick={getLocation}
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              backgroundColor: "#1976d2",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#115293",
              },
              boxShadow: 3,
              width: 56,
              height: 56,
            }}
          >
            <MyLocationIcon />
          </IconButton>
          <div className="form-group">
            <input
              name="latitude"
              value={formData.latitude}
              placeholder="Latitude"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              name="longitude"
              value={formData.longitude}
              placeholder="Longitude"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              name="addressLine1"
              placeholder="Address Line 1"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              name="addressLine2"
              placeholder="Address Line 2"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <select
              name="country"
              onChange={handleChange}
              value={formData.country}
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="state"
              onChange={handleChange}
              value={formData.state}
              disabled={!states.length}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="city"
              onChange={handleChange}
              value={formData.city}
              disabled={!cities.length}
            >
              <option value="">Select City</option>
              {cities.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input
              name="pincode"
              placeholder="Pincode"
              onChange={handleChange}
            />
          </div>
        </div>

        <select name="type" onChange={handleChange} value={formData.type}>
          <option value="appointment">Appointment</option>
          <option value="token">Token</option>
        </select>

        {(formData.type === "appointment" || formData.type === "both") && (
          <>
            <h4>Appointments</h4>{" "}
            <div className="form-group">
              <input
                name="groupSize"
                placeholder="Group Size"
                onChange={handleChange}
              />
            </div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {formData.appointment.map((item, index) => (
                <div
                  key={index}
                  className="appointment-row"
                  style={{ marginBottom: "1rem" }}
                >
                  <label style={{ marginRight: "1rem" }}>{item.day}</label>
                  <TimePicker
                    label="Start Time"
                    value={dayjs(
                      `2024-01-01T${convertTo24Hour(item.startTime)}`
                    )} // controlled value
                    onChange={(newValue) => {
                      handleAppointmentChange(
                        index,
                        "startTime",
                        newValue.format("hh:mm")
                      );
                    }}
                    ampm
                  />
                  <TimePicker
                    label="End Time"
                    value={dayjs(`2024-01-01T${convertTo24Hour(item.endTime)}`)}
                    onChange={(newValue) => {
                      handleAppointmentChange(
                        index,
                        "endTime",
                        newValue.format("hh:mm")
                      );
                    }}
                    ampm
                  />
                  <div className="form-group">
                    <input
                      name="duration"
                      placeholder="duration"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      name="noofpeople"
                      placeholder="Individual Count"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      name="noofgroups"
                      placeholder="Group Count"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ))}
            </LocalizationProvider>
          </>
        )}
        {formData.type === "token" && (
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
                    handleTokenChange(
                      index,
                      "startTokenNo",
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  }
                />
                <input
                  type="number"
                  min="0"
                  placeholder="End Token No"
                  value={item.endTokenNo}
                  onChange={(e) =>
                    handleTokenChange(
                      index,
                      "endTokenNo",
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  }
                />
              </div>
            ))}
          </>
        )}
        <div className="form-actions">
          <button type="submit" className="form-button">
            Submit
          </button>
          <button type="button" className="form-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
