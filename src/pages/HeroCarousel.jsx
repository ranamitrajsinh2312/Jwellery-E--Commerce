import { useState, useEffect } from "react";
import "./Home.css";

const HeroCarousel = () => {
  const slides = [
    "https://vmsilver.in/wp-content/uploads/2024/11/Slider01-1.png",
    "https://vmsilver.in/wp-content/uploads/2024/11/Slider021-1.png",
    "https://www.ramyaraghavijewellers.com/wp-content/uploads/2025/05/Ramya-Raghavi-Jewellers-Hyderabad.jpg" // your 3rd image
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="hero-carousel">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide})` }}
        />
      ))}

      <div className="carousel-controls">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
