import {
  CircleArrowLeft,
  Stethoscope,
  Video,
  FileText,
  FolderHeart,
  CalendarClock,
  LayoutDashboard,
  Headset,
  MapPin,
  Mail,
  Phone,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './services.css';

const Services = () => {
  const navigate = useNavigate();
  const onArrowClick = () => {
    navigate('/');
  };

  const services = [
    {
      icon: Video,
      title: 'Online Consultation',
      desc: 'Book appointments with certified doctors from anywhere via video, chat, or phone.',
    },
    {
      icon: FileText,
      title: 'Prescription Management',
      desc: 'Doctors issue digital prescriptions accessible anytime by patients.',
    },
    {
      icon: FolderHeart,
      title: 'Patient Records',
      desc: 'Secure storage of medical history for doctors and patients.',
    },
    {
      icon: CalendarClock,
      title: 'Appointment Tracking',
      desc: 'Track appointments and receive reminders to reduce missed visits.',
    },
    {
      icon: LayoutDashboard,
      title: 'Role-Based Dashboard',
      desc: 'Customized dashboards for admins, doctors, and patients.',
    },
    {
      icon: Headset,
      title: '24/7 Support',
      desc: 'Get help anytime via chat, email, or phone support.',
    },
  ];

  return (
    <div className="services-page">
      <div className="services-topbar">
        <CircleArrowLeft className="services-back" onClick={onArrowClick} />
        <div className="services-brand">
          <Stethoscope size={22} />
          MediConnect
        </div>
      </div>

      <div className="services-hero">
        <h1>
          Our <span>Services</span>
        </h1>
        <p>
          Comprehensive digital tools built to keep your hospital running
          smoothly.
        </p>
      </div>

      <div className="services-cards">
        {services.map(service => (
          <div className="service-card" key={service.title}>
            <div className="service-icon">
              <service.icon />
            </div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>

      <div className="services-contact">
        <h2>Contact Us</h2>
        <div className="services-contact-grid">
          <div className="services-contact-item">
            <MapPin />
            <span>
              <strong>Address:</strong> 123 Health Street, City, Country
            </span>
          </div>
          <div className="services-contact-item">
            <Mail />
            <span>
              <strong>Email:</strong> support@medicoonect.com
            </span>
          </div>
          <div className="services-contact-item">
            <Phone />
            <span>
              <strong>Phone:</strong> +123 456 7890
            </span>
          </div>
          <div className="services-contact-item">
            <Clock />
            <span>
              <strong>Office Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
