import React from 'react';

export const DressCodeSection: React.FC = () => {
  const palette = [
    { name: 'Olive Green', hex: '#556038' },
    { name: 'Deep Burgundy', hex: '#360d1b' },
    { name: 'Dark Charcoal', hex: '#3a3330' },
    { name: 'Ivory Cream', hex: '#f2eae1', border: '1.5px solid #d5c7b8' },
  ];

  return (
    <section className="section-block">
      <h2 className="section-title">Dress Code</h2>
      
      <img
        src="/assets/line_divider.png"
        alt="Divider"
        className="floral-divider"
      />

      <img
        src="/assets/dress_code_people.png"
        alt="Dress Code Attire"
        className="dress-code-people"
      />

      <p className="dress-code-intro">
        We kindly invite you to dress in elegant attire that reflects the style and spirit of our special day.
      </p>

      <h3 className="palette-subtitle">Color palette</h3>

      <div className="palette-swatches">
        {palette.map((color) => (
          <div
            key={color.name}
            className="swatch-circle"
            style={{
              backgroundColor: color.hex,
              border: color.border || 'none',
            }}
          />
        ))}
      </div>

      <h4 className="role-title">Ladies</h4>
      <p className="role-desc">
        Formal dresses in elegant, polished styles are encouraged.
      </p>

      <h4 className="role-title">Gentlemen</h4>
      <p className="role-desc">
        Well-tailored suits with classic dress shoes are preferred.
      </p>
    </section>
  );
};
