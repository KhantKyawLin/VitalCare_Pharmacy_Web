import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out";

    const variants = {
        primary: "bg-primary-green text-white hover:bg-accent-green hover:shadow-md hover:scale-105",
        danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:scale-105",
        outline: "border-2 border-accent-green text-accent-green bg-transparent hover:bg-accent-green hover:text-white",
        ghost: "text-text-dark hover:text-accent-green hover:-translate-y-1"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;
