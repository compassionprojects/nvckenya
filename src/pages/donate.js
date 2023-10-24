import axios from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Input,
  InputGroup,
  InputGroupText,
  FormGroup,
  Label,
} from 'reactstrap';

export default function Donate() {
  const [value, setValue] = useState(50);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (error) setError(null);
    setSubmitting(true);

    try {
      const { data } = await axios.post('/api/create_payment', {
        value,
        metadata: { email, name },
      });
      window.location = data.paymentUrl.href;
    } catch (error) {
      console.log(error);
      setError('Creating your donation failed');
      setSubmitting(false);
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

        <form onSubmit={onSubmit} className="col-md-6 col-sm-8 mx-auto">
          {error && (
            <Alert color="danger" className="mt-4">
              {error}
            </Alert>
          )}

          <div className="col-12">
            <FormGroup>
              <Label for="name">
                Name <span className="text-body-tertiary">(optional)</span>
              </Label>
              <Input
                placeholder="Your name"
                type="text"
                name="name"
                id="name"
                className="form-control"
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>
          </div>

          <div className="col-12">
            <FormGroup>
              <Label for="email">
                Email <span className="text-body-tertiary">(optional)</span>
              </Label>
              <Input
                placeholder="Your email address"
                type="email"
                name="email"
                id="email"
                className="form-control"
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
          </div>

          <div className="col-12">
            <FormGroup>
              <Label for="donation_amount">Donation amount</Label>
              <InputGroup>
                <InputGroupText>€</InputGroupText>
                <Input
                  placeholder="Enter an amount"
                  name="donation_amount"
                  id="donation_amount"
                  type="number"
                  min={1}
                  required={true}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="form-control money"
                />
              </InputGroup>
            </FormGroup>
          </div>

          <div className="mb-5 mt-5 text-center">
            <Button color="primary" size="lg" disabled={submitting}>
              Donate
            </Button>
          </div>
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
