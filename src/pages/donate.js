import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Input, InputGroup, InputGroupText } from 'reactstrap';

export default function Donate() {
  const [value, setValue] = useState(5);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (error) setError(null);

    try {
      const { data } = await axios.post('/api/create_payment', { value });
      window.location = data.paymentUrl.href;
    } catch (error) {
      console.log(error);
      setError('Creating your donation failed');
    }
  };

  return (
    <div className="px-2 py-5 mt-5 border-bottom">
      <div className="col-lg-6 mx-auto">
        <h1 className="text-center">Donate</h1>
        <div className="my-4">
          <p>
            Your contributions will go towards supporting scholarship funds and
            facilitating the NVC Kenya retreat. These donations will help
            individuals who may not have the means to participate, enabling them
            to benefit from this enriching experience. Your support is greatly
            appreciated and will make a meaningful difference.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="col-md-5 col-sm-8 mx-auto">
            <InputGroup>
              <InputGroupText>€</InputGroupText>
              <Input
                placeholder="Enter an amount"
                name="donation_amount"
                type="number"
                min={1}
                required={true}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="form-control money"
              />
            </InputGroup>
          </div>

          <div className="mb-5 mt-5 text-center">
            <Button color="primary">Donate</Button>
          </div>

          {error && (
            <Alert color="danger" className="mt-4">
              {error}
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}

export const Head = () => {
  return (
    <>
      <title>Donate</title>
    </>
  );
};
