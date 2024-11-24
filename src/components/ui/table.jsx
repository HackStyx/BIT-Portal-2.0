import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <table className={`w-full caption-bottom text-sm ${className}`}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`border-b border-gray-200 dark:border-gray-800 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`border-b border-gray-200 dark:border-gray-800 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`p-4 align-middle ${className}`}>
      {children}
    </td>
  );
}
