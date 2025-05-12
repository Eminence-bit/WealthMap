
import React from 'react';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4" role="alert">
      <p className="font-medium">{message}</p>
    </div>
  );
}
