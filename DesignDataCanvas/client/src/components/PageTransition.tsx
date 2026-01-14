import { useState, useEffect } from 'react';

export default function PageTransition() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return <div className="page-transition"></div>;
}