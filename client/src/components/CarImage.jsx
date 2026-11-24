import React, { useState } from 'react';

// Default luxury vehicle placeholder if image is missing, broken or 404
const DEFAULT_CAR_PLACEHOLDER = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800";

const CarImage = ({ src, alt = "Vehicle", className = "", ...props }) => {
    const [imgSrc, setImgSrc] = useState(src || DEFAULT_CAR_PLACEHOLDER);
    const [hasError, setHasError] = useState(false);

    // Update if prop changes
    React.useEffect(() => {
        setImgSrc(src || DEFAULT_CAR_PLACEHOLDER);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(DEFAULT_CAR_PLACEHOLDER);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            onError={handleError}
            className={className}
            loading="lazy"
            {...props}
        />
    );
};

export default CarImage;
