import { useState } from 'react';
import { HiOutlineInformationCircle, HiOutlineChevronRight, HiOutlineChevronLeft } from 'react-icons/hi';
import './InstructionPanel.css';

const InstructionPanel = ({ title, instructions }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`instruction-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="instruction-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <HiOutlineChevronRight size={20} /> : <HiOutlineChevronLeft size={20} />}
      </div>
      
      <div className="instruction-content">
        <div className="instruction-header">
          <HiOutlineInformationCircle className="instruction-icon" size={24} />
          <h3 className="instruction-title">{title}</h3>
        </div>
        
        <ul className="instruction-list">
          {instructions.map((inst, index) => (
            <li key={index} className="instruction-item">
              <span className="instruction-bullet"></span>
              {inst}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InstructionPanel;
