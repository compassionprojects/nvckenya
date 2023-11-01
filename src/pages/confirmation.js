import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import marked from '../lib/marked';

// latest retreat
export const query = graphql`
  query {
    allRetreatsYaml(sort: { start_date: ASC }) {
      edges {
        node {
          scholarship_info
          contact_email
          confirmation_message
          currency {
            symbol
          }
          payment_options {
            bank_transfer
            mobile_money_transfer
          }
        }
      }
    }
  }
`;

export default function Confirmation({ data }) {
  // latest retreat
  const {
    scholarship_info,
    contact_email,
    confirmation_message,
    payment_options,
    currency,
  } = data.allRetreatsYaml.edges[0].node;
  const [needScholarship, setNeedScholarship] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState();
  const [totalPayable, setTotalPayable] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setNeedScholarship(params.get('need_scholarship') === 'true');
    setPaymentMethod(params.get('payment_method'));
    setTotalPayable(parseInt(params.get('total_payable') || 0, 10));
  }, [needScholarship, paymentMethod, totalPayable]);

  return (
    <div className="px-2 py-5 mt-5 border-bottom">
      <div className="col-lg-6 mx-auto">
        <h1 className="text-center">Thank you!</h1>
        <div
          className="my-4 text-center"
          dangerouslySetInnerHTML={{ __html: marked(confirmation_message) }}
        />
        {needScholarship && (
          <div>
            <strong>Scholarship info</strong>
            <div
              className="my-2"
              dangerouslySetInnerHTML={{ __html: marked(scholarship_info) }}
            />
          </div>
        )}
        {!needScholarship &&
          paymentMethod &&
          payment_options[paymentMethod] && (
            <div>
              <strong>Payment</strong>
              <div className="my-2 respect-newlines">
                {payment_options[paymentMethod]}
              </div>
              {totalPayable > 0 && (
                <div className="my-2">
                  Total Payable: {totalPayable}
                  {currency.symbol}
                </div>
              )}
            </div>
          )}
        <div className="mb-5 mt-3 text-center">
          <a href={`mailto:${contact_email}`} className="btn btn-secondary">
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
}

Confirmation.propTypes = {
  data: PropTypes.object,
};

export const Head = () => {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <title>Thank you</title>
    </>
  );
};
