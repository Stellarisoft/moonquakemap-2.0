// RangeSlider.tsx

import React, { useState } from 'react';
import './RangeSelector.css';

interface RangeSelectorProps {
    min: number;
    max: number;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({ min, max }) => {
    const [minValue, setMinValue] = useState(min);
    const [maxValue, setMaxValue] = useState(max);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMinValue(+e.target.value);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaxValue(+e.target.value);
    };

    const to_date = (epoch: number) => {
        const d = new Date(0)
        d.setUTCSeconds(epoch)
        return d.toDateString()
    }

    return (
        <div className="range-slider">
            <input
                id="minDate"
                type="range"
                min={min}
                max={max}
                value={minValue}
                onChange={handleMinChange}
            />
            <h1>From: {to_date(minValue)}</h1>
            <input
                id="maxDate"
                type="range"
                min={min}
                max={max}
                value={maxValue}
                onChange={handleMaxChange}
            />
            <h1>Up until: {to_date(maxValue)}</h1>

        </div>
    );
};

export default RangeSelector;