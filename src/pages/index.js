import * as React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';

export const query = graphql`
  query {
    allRetreatsYaml(sort: { start_date: ASC }) {
      edges {
        node {
          intro
          title
          contact_email
          start_date
          end_date
          hero_image {
            publicURL
          }
        }
      }
    }
  }
`;

export default function Home({ data }) {
  // display the latest retreat
  const { title, intro, contact_email, hero_image } =
    data.allRetreatsYaml.edges[0].node;

  return (
    <div className="px-2 pt-5 my-5 text-center">
      <h1 className="display-4 fw-bold text-body-emphasis">{title}</h1>
      <div className="col-lg-6 mx-auto">
        <p className="lead my-4">{intro}</p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
          <a
            href={`mailto:${contact_email}`}
            className="btn btn-primary btn-lg px-4 me-sm-3">
            Contact us
          </a>
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg px-4">
            Program
          </button>
        </div>
      </div>
      <div className="" style={{ maxHeight: '30vh' }}>
        <div className="container px-lg-5">
          <img
            src={hero_image.publicURL}
            className="img-fluid border rounded-3 shadow-lg mb-4"
            alt="Hero Image"
            width={700}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

Home.propTypes = {
  data: PropTypes.object,
};

export const Head = () => <title>NVC Kenya</title>;
