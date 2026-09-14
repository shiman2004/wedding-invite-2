import React from 'react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="footer-section">
      {/* Golden Moorish Arch Bride & Groom Artwork */}
      <img
        src="/assets/couple_arch.png"
        alt="Amira & Yusuf Arch"
        className="footer-couple-arch-img"
      />

      {/* Script Message */}
      <h3 className="footer-message">
        Looking forward to celebrating with you
      </h3>

      {/* Decorative Gold Line with Centered Flower Knot */}
      <div className="footer-decor-line-box">
        <img
          src="/assets/decor_line.png"
          alt="Divider"
          className="footer-line-img"
        />
        <img
          src="/assets/fine_flower_knot.png"
          alt="Flower Knot"
          className="footer-knot-img"
        />
      </div>
    </footer>
  );
};
