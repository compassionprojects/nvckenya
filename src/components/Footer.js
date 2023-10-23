import React from 'react';

export default function Footer() {
  return (
    <div className="my-5 text-center">
      <div className="py-5">
        <a href="/">Home</a> &nbsp; <a href="/donate">Donate</a>
      </div>
      <footer className="mt-5 pb-5 text-center text-body-tertiary small">
        Made with &#x2764; by Madhu using Gatsby.js &#183;{' '}
        <a
          className="text-reset text-decoration-none pb-1"
          style={{ borderBottom: '1px dashed' }}
          href="https://github.com/compassionprojects/nvckenya"
          target="_blank"
          rel="noreferrer">
          Source
        </a>
      </footer>
    </div>
  );
}
