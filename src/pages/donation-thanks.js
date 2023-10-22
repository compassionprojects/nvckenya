import React from 'react';

export default function Donated() {
  return (
    <div className="px-2 py-5 mt-5 border-bottom">
      <div className="col-lg-6 mx-auto">
        <h1 className="text-center">Thank you</h1>
        <div className="my-4 text-center">
          <p>Thank you for donating! We really appreciate your support.</p>
        </div>
      </div>
    </div>
  );
}

export const Head = () => {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <title>Thank you</title>
    </>
  );
};
