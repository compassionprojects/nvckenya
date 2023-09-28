import React from 'react';

export default function Footer() {
  return (
    <footer className="my-5 py-5 text-center text-muted small">
      Made with &#x2764; by Madhu &#183; Thanks to Gatsby.js &#183;{' '}
      <a
        className="text-reset text-decoration-none pb-1"
        style={{ borderBottom: '1px dotted' }}
        href="https://github.com/compassionprojects/nvckenya"
        target="_blank"
        rel="noreferrer">
        Source code
      </a>
    </footer>
  );
}
